# Push-Based Synchronisation Strategy

## Rationale
Pitt CRC cannot accept inbound connections. All updates must be **initiated from Pitt** via outbound HTTPS.

## Bulk Update Workflow

```
1. Pitt generates IPA + embeddings (batch of 100k records)
   ↓
2. Prepare Elasticsearch _bulk API payload:
   - NDJSON format
   - Include document version numbers
   - Split into chunks (5k docs per request)
   ↓
3. HTTP POST to DigitalOcean Elasticsearch:
   - Endpoint: https://whg-es.example.com/_bulk
   - Authentication: API key in header
   - Timeout: 60s per request
   ↓
4. Handle responses (see Section 7.4)
   ↓
5. Verify (see Section 7.5)
```

## Authentication & Security

- **API Key**: Dedicated Elasticsearch API key with restricted permissions:
  - Write access to `ipa_index`, `toponym_index` only.
  - No delete permissions.
  - Rate limit: 100 req/min.
- **Network**: Whitelist Pitt CRC outbound IP range on Elasticsearch firewall.
- **Audit log**: All _bulk operations logged in Elasticsearch audit trail.

## Resilience Strategy

**Problem**: Network failures, rate limits, or partial updates corrupt the index.

**Solution**: Robust error handling with retries and checksums.

```python
# Pseudocode for Pitt bulk push script

def push_bulk_update(docs, max_retries=3):
    batch_id = uuid4()
    checksum = sha256(json.dumps(docs, sort_keys=True))
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{ES_URL}/_bulk",
                headers={"Authorization": f"ApiKey {API_KEY}"},
                data=ndjson_format(docs),
                timeout=60
            )
            
            if response.status_code == 429:  # Rate limit
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
                
            result = response.json()
            
            # Check for partial failures
            failed_docs = [item for item in result['items'] 
                           if item['index']['status'] >= 400]
            
            if failed_docs:
                log_failures(batch_id, failed_docs)
                # Add to retry queue with exponential backoff
                enqueue_retry(failed_docs, delay=2**attempt * 60)
            else:
                log_success(batch_id, checksum, len(docs))
                return True
                
        except requests.exceptions.Timeout:
            log_error(f"Timeout on attempt {attempt}")
            time.sleep(2 ** attempt)
            
    # All retries failed
    alert_admin(batch_id, docs)
    return False
```

**Retry queue**: Separate persistent queue (SQLite or Redis) for failed documents.

**Monitoring**: Grafana dashboard tracking:
- Successful/failed bulk operations per hour.
- Average latency per batch size.
- Retry queue depth.

## Verification Strategy

After each bulk push:

1. **Count verification**:
   ```bash
   curl "$ES_URL/ipa_index/_count?q=embedding_version:v4_20251201"
   ```
   Compare with expected count from Pitt.

2. **Sample verification**:
   - Randomly sample 100 `ipa_id` values.
   - Retrieve from Elasticsearch.
   - Compare checksums with Pitt source data.

3. **Timestamp check**:
   - Query for documents with `last_updated < expected_date`.
   - Alert if any found (indicates missed updates).

4. **Store metadata**:
   ```json
   // Pitt maintains sync state
   {
     "batch_id": "uuid",
     "timestamp": "2025-11-17T10:30:00Z",
     "embedding_version": "v4_20251201",
     "doc_count": 1234567,
     "checksum": "sha256_hash",
     "status": "verified"
   }
   ```