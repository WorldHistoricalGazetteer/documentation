# Reconciliation Overview

Understanding and using WHG's reconciliation system to link your data with existing place records.

## Note to Documentation Team

Reconciliation is critical but conceptually challenging. Consider:
- Visual flowcharts showing reconciliation workflow
- Before/after examples of reconciled vs unreconciled data
- Interactive tutorial allowing users to practice reconciliation decisions
- Decision trees: "Should I accept this match?"
- Common pitfalls and how to avoid them
- Metrics showing value of reconciliation (network effects)
- Case studies of successful reconciliation projects
- Video demonstrations of reconciliation UI
- Comparison to other reconciliation services (OpenRefine, etc.)
- Technical documentation for API-based reconciliation
- Explanation of matching algorithms (without overwhelming users)
- Discussion of false positives vs false negatives tradeoffs

---

## What is Reconciliation?

**Definition**: Reconciliation is the process of identifying when your place data refers to the same place as an existing WHG record, and creating a link between them.

**Why It Matters**:
- **Enrichment**: Your places inherit context from linked records
- **Disambiguation**: Clarify which "Paris" or "Springfield" you mean
- **Network Effects**: Your data becomes part of the knowledge graph
- **Discovery**: Your data appears when others search for that place
- **Research Value**: Enables cross-dataset analysis
- **Reduce Duplication**: Avoid creating redundant records

**Analogy**: Think of reconciliation like connecting your family tree to a genealogical database - you identify where your ancestors match people already in the system, enriching both datasets.

## Reconciliation in Practice

### Example Scenario

You have a dataset of 200 medieval trading posts with:
- Names in various languages
- Approximate coordinates
- Date ranges

**Without Reconciliation**:
- Your 200 places exist in isolation
- Duplicate records may exist in WHG
- No connections to other datasets
- Limited discoverability

**With Reconciliation**:
- 150 match existing WHG places → linked
- 50 are new → added as new records
- Your data now:
  - Inherits alternate names from other sources
  - Connects to trade networks
  - Appears in searches for those places
  - Contributes to scholarly consensus

## The Reconciliation Workflow

### High-Level Process

```
1. Upload Your Data
         ↓
2. WHG Suggests Matches (automated)
         ↓
3. You Review Suggestions (manual)
         ↓
4. Accept, Reject, or Defer Each Match
         ↓
5. Unmatched Records → New Places
         ↓
6. Matched Records → Linked to Existing
         ↓
7. Publication
```

### Step 1: Automated Matching

When you upload data, WHG automatically:

**Searches for potential matches using**:
- Name similarity (fuzzy matching, transliteration)
- Geographic proximity
- Temporal overlap
- Type similarity
- External identifier matches (if you provide them)

**Generates match confidence scores**:
- 0.95 - 1.0: Very likely match
- 0.80 - 0.95: Probable match
- 0.60 - 0.80: Possible match
- Below 0.60: Unlikely (not shown by default)

**Presents ranked suggestions**:
- Top 1-5 candidates per place
- With evidence for each match
- Visual comparison tools

### Step 2: Manual Review

You review each suggested match and decide:

**Accept**: 
- Yes, this is the same place
- Creates link between your record and WHG record
- Your attestations are added to that place

**Reject**:
- No, these are different places
- Your place will become a new record
- Rejection is recorded to improve matching

**Defer**:
- Unsure, need more research
- Mark for later review
- Record remains unprocessed

**Split Decision**:
- Partially the same (rare)
- Some attributes match, others don't
- Requires consultation with WHG team

### Step 3: Post-Reconciliation Actions

After review:

**For Matched Places**:
- Your data contributes attestations
- Place gets richer, more comprehensive
- You're credited as contributor

**For Unmatched Places**:
- New place records created
- Still searchable and discoverable
- May match future contributions

**For Deferred**:
- Saved for later review
- Can consult with experts
- Not blocking publication (if you choose)

## Reconciliation Strategies

### Strategy 1: Conservative (High Precision)

**Approach**: Only accept very confident matches (≥0.9)

**Best For**:
- Datasets where precision is critical
- When false positives would be problematic
- Initial passes on unfamiliar data

**Tradeoff**: May miss valid matches → more new records created

### Strategy 2: Aggressive (High Recall)

**Approach**: Accept lower confidence matches (≥0.7)

**Best For**:
- Well-known, unambiguous places
- When you can verify matches externally
- Datasets with reliable coordinates

**Tradeoff**: May create false positive matches → requires careful review

### Strategy 3: Mixed

**Approach**: 
- Auto-accept very high confidence (≥0.95)
- Manually review medium confidence (0.75-0.95)
- Auto-reject low confidence (<0.75)

**Best For**: Most use cases

**Tradeoff**: Balanced, but requires time investment

### Strategy 4: Identifier-Based

**Approach**: If you have external identifiers (Pleiades, GeoNames, Wikidata), use them

**Best For**:
- Datasets derived from existing gazetteers
- Data already linked to authority files

**Tradeoff**: Limited to places with existing identifiers

## What Makes a Good Match?

### Strong Evidence For Match

✅ **Name Match**: Identical or very similar name
✅ **Geographic Proximity**: Within expected margin of error
✅ **Temporal Overlap**: Date ranges overlap or are adjacent
✅ **Type Agreement**: Same or compatible place types
✅ **Source Overlap**: Same external sources mentioned
✅ **External ID**: Matching Pleiades/GeoNames/Wikidata ID

**Example Good Match**:
```
Your Record:
  Name: "Konstantinopolis"
  Coordinates: 41.01°N, 28.98°E
  Dates: 330-1453 CE
  Type: City
  
WHG Candidate:
  Name: "Constantinople"  
  Coordinates: 41.01°N, 28.98°E (± 1km)
  Dates: 330-1930 CE
  Type: Imperial Capital
  
Match Score: 0.98 → ACCEPT
```

### Weak Evidence Against Match

⚠️ **Name Similarity**: Common names (e.g., "Springfield", "San Juan")
⚠️ **Geographic Distance**: >50km apart (depends on precision)
⚠️ **Temporal Gap**: No overlap in date ranges
⚠️ **Type Mismatch**: Incompatible types (city vs river)
⚠️ **Source Conflict**: Sources explicitly distinguish them

**Example False Positive**:
```
Your Record:
  Name: "Alexandria"
  Coordinates: 31.20°N, 29.92°E (± 50km)
  Dates: 300 BCE - 700 CE
  Type: City
  
WHG Candidate:
  Name: "Alexandria"
  Coordinates: 38.80°N, -77.05°E
  Dates: 1749 CE - present
  Type: City
  
Match Score: 0.75 (name match, but wrong location)
→ REJECT (different places, same name)
```

## Handling Ambiguous Cases

### Ambiguity Type 1: Name Reuse

**Problem**: Same name applied to different places

**Example**: Multiple cities named "Alexandria" founded by Alexander

**Solution**:
- Check geographic coordinates carefully
- Verify temporal context
- Look at type and regional context
- Consult external sources

**Decision Rule**: When in doubt, reject - false negative better than false positive

### Ambiguity Type 2: Coordinate Uncertainty

**Problem**: Historical coordinates often imprecise

**Example**: Your data says "45.5°N, 10.2°E ± 20km", candidate is at 45.6°N, 10.3°E

**Solution**:
- Consider uncertainty margins
- Look for other evidence (names, dates)
- Check if uncertainty regions overlap

**Decision Rule**: If uncertainty regions overlap AND other evidence aligns, accept

### Ambiguity Type 3: Temporal Edge Cases

**Problem**: Uncertain whether date ranges represent same vs successive places

**Example**: 
- Your record: "Sarai" (1250-1395 CE)
- Candidate: "New Sarai" (1380-1502 CE)

**Solution**:
- Research whether these are same place (name change) or different places (relocation)
- Check sources for clarification
- Consider "succeeded_by" relationship instead of equivalence

**Decision Rule**: Defer and consult sources; when in doubt, use succession relation

### Ambiguity Type 4: Changing Boundaries

**Problem**: Place expanded, contracted, or moved over time

**Example**: A city whose limits changed dramatically

**Solution**:
- Consider whether core identity remained constant
- Multiple geometries can coexist on same place record
- Accept match, contribute new temporal geometry

**Decision Rule**: Usually accept - temporal change is captured via attestations

## Tools for Reconciliation

### WHG Reconciliation Interface

**Features**:
- Side-by-side comparison view
- Map overlay showing coordinate distance
- Timeline showing temporal overlap
- Confidence score with explanation
- Quick accept/reject/defer buttons
- Bulk operations for confident matches
- Notes field for decision rationale

See [Manual Reconciliation](manual.md) for interface guide

### Automated Reconciliation

**For larger datasets**:
- Set confidence threshold
- Auto-accept above threshold
- Auto-reject below threshold
- Manual review middle range

See [Automated Reconciliation](automated.md)

### Reconciliation API

**For programmatic access**:
- Submit place data
- Receive match candidates
- Return decisions
- Integrated into your workflow

See [Reconciliation API Usage](api.md)

### External Tools Integration

**OpenRefine Reconciliation Service**:
- WHG provides OpenRefine-compatible endpoint
- Reconcile in OpenRefine, then upload to WHG
- Familiar interface for experienced users

## Reconciliation Best Practices

### Before You Start

1. **Clean your data** - Fix obvious errors in names, coordinates
2. **Standardize formats** - Consistent date formats, coordinate systems
3. **Add external IDs if available** - Pleiades, GeoNames, etc.
4. **Document uncertainty** - Mark uncertain coordinates/dates
5. **Review a sample** - Manually check 10-20 records to understand your data

### During Reconciliation

1. **Start with high-confidence matches** - Build pattern recognition
2. **Use filtering** - Review similar types together
3. **Take notes** - Document ambiguous decisions
4. **Take breaks** - Decision fatigue is real
5. **Consult sources** - When uncertain, go back to original sources
6. **Ask for help** - Use WHG forums for difficult cases
7. **Be conservative** - When truly unsure, defer rather than guess

### After Reconciliation

1. **Review statistics** - Match rate, rejection rate (red flags?)
2. **Spot check** - Review sample of accepted matches
3. **Document methodology** - For transparency and reproducibility
4. **Report issues** - If matching algorithm seems problematic
5. **Update records** - As you learn more, can revisit decisions

## Common Pitfalls

### Pitfall 1: Over-Trusting Automation

**Problem**: Accepting all high-score matches without review

**Why Bad**: Algorithms can be wrong; local knowledge matters

**Solution**: Always review, especially for historically complex regions

### Pitfall 2: Under-Trusting Automation

**Problem**: Rejecting obvious matches due to minor discrepancies

**Why Bad**: Wastes opportunity for enrichment; creates duplicates

**Solution**: Allow for spelling variations, coordinate imprecision

### Pitfall 3: Conflating Related Places

**Problem**: Matching places that are related but distinct (e.g., Old City vs New City)

**Why Bad**: Muddies historical record; creates false equivalences

**Solution**: Use relationship types (part_of, near, succeeded_by) instead

### Pitfall 4: Ignoring Temporal Context

**Problem**: Matching based on name alone without checking dates

**Why Bad**: Many places reuse names across time

**Solution**: Always verify temporal overlap

### Pitfall 5: Batch Accepting Without Sampling

**Problem**: Auto-accepting hundreds of matches without spot-checking

**Why Bad**: Errors compound; hard to undo

**Solution**: Sample review 10% before bulk operations

## Measuring Reconciliation Success

### Key Metrics

**Match Rate**: Percentage of your records matched
- Good: 60-80% for well-known places
- Expected: 30-60% for specialized datasets
- Low: <30% may indicate matching issues or genuinely new places

**False Positive Rate**: Incorrectly accepted matches
- Goal: <5%
- Monitor via post-review sampling

**False Negative Rate**: Incorrectly rejected matches
- Harder to measure
- Look for duplicates in published data

**Review Time**: Hours per 100 records
- Varies widely: 0.5-5 hours
- Decreases with experience

### Quality Indicators

✅ Matched records have strong supporting evidence
✅ Rejection rationales documented
✅ Deferred cases have research notes
✅ No obvious duplicates post-publication
✅ Community feedback is positive

## Getting Help with Reconciliation

### Resources

- **Documentation**: This guide and [Manual Reconciliation](manual.md)
- **Video Tutorials**: [link to video library]
- **Community Forum**: Ask experienced contributors
- **Office Hours**: Weekly reconciliation Q&A sessions
- **Consultation**: Email reconciliation@whgazetteer.org

### When to Seek Help

- Unfamiliar historical/geographic context
- Systematic matching problems
- Ambiguous case patterns
- Technical issues with interface
- Large dataset (>1000 records) planning

## Next Steps

**Learn the Interface**:
→ [Manual Reconciliation Guide](manual.md)

**Automate at Scale**:
→ [Automated Reconciliation](automated.md)

**Use External Tools**:
→ [Reconciliation API](api.md)

**Start Practicing**:
→ [Reconciliation Tutorial](../tutorials/reconciliation-tutorial.md)

**Review Matches**:
→ [Reviewing Matches](reviewing.md)