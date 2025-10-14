# Frequently Asked Questions

Answers to common questions about using the World Historical Gazetteer.

## Note to Documentation Team

FAQ should be:
- Organized by category/topic
- Based on actual user questions (monitor support channels)
- Updated regularly as new questions emerge
- Include links to detailed documentation
- Consider upvoting/rating to surface most helpful answers
- Add search functionality
- Include "related questions" for each answer
- Make it the first place confused users look
- Track which questions drive most traffic
- Consider video answers for complex questions
- Cross-reference troubleshooting guides
- Include examples and screenshots where helpful

---

## General Questions

### What is the World Historical Gazetteer?

WHG is a collaborative digital infrastructure for historical place data. It provides:
- A searchable database of historical places with temporal context
- Tools for contributing and linking place data
- Reconciliation services connecting datasets
- Visualization and analysis capabilities
- Open access to historical geographic knowledge

**Unlike traditional gazetteers**, WHG explicitly models temporal change, uncertainty, and multiple scholarly perspectives.

See: [Quick Start Guide](../getting-started/quickstart.md)

### Is WHG free to use?

Yes. WHG is freely accessible for:
- Searching and browsing place data
- Downloading data for research and education
- API access for integration
- Contributing data

WHG is supported by grants and institutional partnerships.

### Who should use WHG?

**Researchers**: Historians, archaeologists, geographers, digital humanists
**Educators**: Teachers needing historical place resources
**Data Contributors**: Projects with historical place data to share
**Developers**: Building applications that need historical place lookup
**General Public**: Anyone interested in historical geography

### What time periods does WHG cover?

WHG covers **all historical periods**, from prehistory to the present. The temporal range depends on contributed data - some regions/periods are better covered than others.

Coverage is strongest for:
- Classical Mediterranean (via Pleiades)
- East Asia (via CHGIS)
- Medieval Europe
- Early modern trade routes

### What geographic regions does WHG cover?

WHG is **global in scope**, but coverage varies by region. Well-represented areas include:
- Mediterranean world
- Europe
- East and South Asia
- Middle East and North Africa

We actively seek contributions for under-represented regions including Africa, Americas (especially pre-colonial), Oceania, and Central Asia.

### How is WHG different from Google Maps or GeoNames?

| Feature | WHG | Google Maps | GeoNames |
|---------|-----|-------------|----------|
| **Time** | Fully temporal | Modern only | Mostly modern |
| **History** | Ancient to modern | Current | Limited historical |
| **Uncertainty** | Explicitly modeled | Not modeled | Not modeled |
| **Provenance** | All sources cited | No attribution | Limited attribution |
| **Multiple Views** | Multiple perspectives coexist | Single "truth" | Single "truth" |
| **Names** | Historical variants in original scripts | Modern names | Limited variants |

**Use WHG** for historical research, temporal analysis, understanding how places changed
**Use Google Maps** for navigation, modern locations, current business information
**Use GeoNames** for modern place name lookup, administrative hierarchies

## Searching Questions

### Why can't I find a place I know exists?

Several possible reasons:

**1. Spelling/Transliteration**: Try alternate spellings
- Example: Try both "Qusṭanṭīnīyah" and "Constantinople"

**2. Time Period**: Adjust temporal range slider
- The place may exist outside your current time filter

**3. Name Change**: Search for alternate historical names
- Example: Istanbul was Constantinople was Byzantion

**4. Not Yet in WHG**: The place may not have been contributed yet
- Consider contributing it!

**5. Different Language**: Try the name in the local language/script
- Example: Search "京都" not just "Kyoto"

See: [Search Problems](search-problems.md)

### How do I search for places in non-Latin scripts?

WHG fully supports non-Latin scripts:

**1. Type directly** in the search box (if your keyboard supports it)
- Example: 北京, القاهرة, Κωνσταντινούπολις

**2. Use transliterations** - WHG will find original scripts
- Example: "Beijing" finds "北京"

**3. Use character pickers/input methods** provided in advanced search

See: [Working with Scripts & Languages](../advanced/languages.md)

### Why do I see multiple results for the same place?

This can indicate:

**1. Legitimate duplicates**: Different datasets contributed same place without reconciliation
- Solution: Report via GitHub or help reconcile

**2. Actually different places**: Same name, different locations
- Example: Multiple "Alexandrias" founded by Alexander
- Check coordinates and temporal context

**3. Different aspects**: Same place at different times treated separately
- Example: Ancient Rome vs Medieval Rome might be separate subjects
- Check temporal ranges

### What does the certainty score mean?

Certainty scores (0.0-1.0) indicate confidence in an attestation:

- **0.9-1.0** (✓✓✓): Very confident, well-documented
- **0.7-0.9** (✓✓): Probable, reasonable evidence
- **0.5-0.7** (✓): Uncertain, limited evidence
- **Below 0.5**: Speculative, questionable

**Important**: Low certainty ≠ wrong. It means "we're not sure" which is valuable information.

See: [Working with Uncertainty](../search/uncertainty.md)

## Contributing Data Questions

### How do I contribute data to WHG?

The basic process:

1. **Create an account**
2. **Prepare your data** (see format requirements)
3. **Upload** via web interface or API
4. **Reconcile** with existing records
5. **Submit for review**
6. **Publication** after approval

See: [Contributing Data Overview](../contributing/overview.md)

### What format should my data be in?

WHG accepts:
- **CSV**: Simple spreadsheet format (best for beginners)
- **GeoJSON**: Standard geographic format
- **LPF JSON**: Linked Places Format (most expressive)
- **Web forms**: For small datasets, enter directly

**Minimum required fields**:
- Place name(s)
- At least rough coordinates or region
- Temporal context (century-level acceptable)
- Source citation(s)

See: [Data Formats](../contributing/formats.md)

### Do I need coordinates for every place?

**Preferred**: Yes, coordinates enable spatial search and mapping

**Acceptable**: General region or "near" relationship to known place
- Example: "Somewhere in Mesopotamia" or "Near Babylon"

**Future**: WHG may support gazetteer-style hierarchical location (TBD)

### How long does review take?

**Timeline varies** by contribution size and complexity:
- **Small** (<50 places): 1-2 weeks
- **Medium** (50-1000 places): 2-6 weeks
- **Large** (>1000 places): 2-6 months with planning

**Factors affecting timeline**:
- Data quality
- Complexity of reconciliation
- Reviewer availability
- Novelty/difficulty of content

### What happens to my data after I contribute it?

**You retain copyright** to your data

**WHG gets license** to host, display, and distribute it

**Your data**:
- Becomes searchable by all users
- Is attributed to you
- Can be downloaded (per your chosen license)
- Can be edited/enhanced by you anytime
- **Cannot be deleted** after publication (but can be deprecated)

**We recommend open licenses** (CC0, CC-BY) for maximum research impact

See: [Contribution Overview: Data Licensing](../contributing/overview.md#data-licensing)

### Can I update my contribution after publication?

**Yes!** You can:
- Add new attestations (names, geometries, etc.)
- Refine temporal bounds
- Correct errors
- Add sources
- Enhance existing data

**You cannot**:
- Delete published records
- Remove attestations from other contributors
- Change fundamental identity (requires consultation)

See: [Updating Contributions](../contributing/updating.md)

## Technical Questions

### Does WHG have an API?

**Yes!** WHG provides REST APIs for:
- **Search**: Query places programmatically
- **Reconciliation**: Match your places to WHG records
- **Retrieval**: Get full place records
- **Contribution**: Submit data programmatically (requires authentication)

**API Documentation**: [link to API docs]

See: [Using the API](../export/api-basics.md)

### Can I use WHG data in my project?

**Yes**, subject to license terms:
- Most WHG data is under open licenses (CC0, CC-BY, CC-BY-SA)
- Check individual dataset licenses
- **Always attribute** sources appropriately
- Cite WHG using provided DOIs

See: [Citation & Attribution](../export/citation.md)

### How do I cite WHG?

**Citing the platform**:
```
World Historical Gazetteer. (2024). Pittsburgh: University of Pittsburgh. 
https://whgazetteer.org
```

**Citing a specific dataset**:
```
[Author]. (Year). [Dataset Title] [Data set]. World Historical Gazetteer. 
https://doi.org/[DOI]
```

**Citing a specific place**:
```
"[Place Name]," World Historical Gazetteer, accessed [Date], 
https://whgazetteer.org/places/[ID]
```

See: [Citation & Attribution](../export/citation.md)

### Can I download all of WHG?

**Yes**, with caveats:
- **Bulk export** is available via API
- Large exports may take time
- Respect license terms for each dataset
- Attribution required

**Recommended**: Download only what you need, or specific datasets

See: [Bulk Export](../export/bulk.md)

### What software integrations exist?

WHG integrates with:
- **OpenRefine**: Reconciliation service
- **QGIS**: Via GeoJSON export
- **ArcGIS**: Via GeoJSON export
- **Python**: API client libraries
- **R**: API access via httr/jsonlite
- **Jupyter Notebooks**: Analysis workflows

See: [Integrating with GIS Software](../export/gis.md), [Integrating with Research Tools](../export/research-tools.md)

## Data Model Questions

### What is an attestation?

An **attestation** is a source-backed claim connecting a subject (place) to information. 

**Structure**: `[Subject] --[relation_type]--> [Object]` with source, timespan, certainty

**Example**: "[Constantinople] has_name [Name: 'Istanbul'] according to [source] from [1930-present]"

**Why attestations?**:
- Explicit provenance
- Multiple perspectives can coexist
- Uncertainty is modeled
- Temporal context always present

See: [Understanding WHG Concepts: Attestations](../getting-started/concepts.md#the-attestation-model)

### Why does WHG use this complex model?

**Short answer**: Historical knowledge is complex, contested, and uncertain. Simple models lose important information.

**The attestation model enables**:
- Multiple sources making different claims
- Scholarly disagreement to coexist
- Uncertainty to be explicit
- Changes over time to be tracked
- Provenance to be traceable

**Trade-off**: More complex, but much richer and more honest

See: [Data Model Overview](../../v4/data-model.html)

### What's the difference between a Subject and a Place?

**Subject**: The abstract entity that existed in the world
**Place**: What we colloquially call it, but technically it's the subject plus all its attestations

Think of it like:
- **Subject** = the person "William Shakespeare"
- **Attestations** = all the facts we know about him

The subject is the "hook" that holds all the information together.

See: [Core Entities: Subjects](../../v4/data-model/overview.html)

### Can one place have multiple geometries?

**Yes**, and this is common:

**Reasons for multiple geometries**:
- **Temporal change**: City expanded, moved, or contracted
- **Uncertainty**: Multiple possible locations
- **Different sources**: Conflicting geographic claims
- **Multiple representations**: Point for searching, polygon for extent

**Example**: Medieval city might have:
- Point: City center
- Polygon: Walled area
- Larger polygon: Suburbs
- All with different timespans

See: [Geometries & Locations](../places/geometries.md)

## Account & Access Questions

### Do I need an account to search WHG?

**No** - Searching, browsing, and downloading are freely accessible without an account

**Account needed for**:
- Contributing data
- Creating collections
- Saving searches
- Editing records
- API access (for writes)

### How do I create an account?

1. Click "Sign Up" in top navigation
2. Provide email and create password
3. Verify email address
4. Complete profile (optional but recommended)

**Account is free** and takes <2 minutes

See: [Creating an Account](../getting-started/account.md)

### I forgot my password. What do I do?

1. Click "Login"
2. Click "Forgot Password?"
3. Enter your email
4. Check email for reset link (check spam!)
5. Create new password

**Still having trouble?** Email support@whgazetteer.org

### How do I get editing permissions?

**For contributed data**: You automatically have editing rights

**For others' data**: 
- Must be granted permissions by dataset owner or WHG administrators
- Usually requires being part of a collaborative project
- Contact dataset owner or support@whgazetteer.org

See: [Editing Permissions](../editing/permissions.md)

## Troubleshooting Questions

### The map isn't loading. What's wrong?

**Common causes**:

1. **Slow connection**: Large datasets take time to load
2. **Browser issues**: Try refreshing, clearing cache
3. **Too many points**: Map may timeout on very large result sets
   - Solution: Filter/refine your search
4. **Browser compatibility**: Use Chrome, Firefox, Safari, or Edge (recent versions)

See: [Performance & Timeouts](performance.md)

### My upload failed. What happened?

**Check for**:

1. **File format errors**: Ensure valid CSV/JSON/GeoJSON
2. **Required fields missing**: Name, coordinates, temporal info needed
3. **File size limits**: Very large files may timeout
   - Solution: Split into smaller batches
4. **Invalid data**: Check error messages for specifics

**Still stuck?** Email the error message to support@whgazetteer.org

See: [Upload Problems](upload-problems.md)

### Search is very slow. How can I speed it up?

**Optimization strategies**:

1. **Add temporal constraints**: Narrow date range
2. **Add spatial constraints**: Limit to region
3. **Be more specific**: Use more precise search terms
4. **Filter results**: Apply type or certainty filters
5. **Check network**: Slow connection affects performance

**System Status**: Check [status page] for known issues

See: [Performance & Timeouts](performance.md)

### Why can't I see my contribution?

**Possible reasons**:

1. **Still in review**: Check your account dashboard for status
2. **Not published yet**: Approval pending
3. **Cache delay**: Try refreshing, clearing browser cache
4. **Search parameters**: May be filtered out by your search
5. **Error during ingestion**: Check for email notification

**Timeline**: Most contributions appear within minutes of approval

## Community & Support Questions

### How can I get help?

**Resources**:
- **This Documentation**: Comprehensive guides
- **Community Forum**: Ask questions, share tips
- **Email Support**: support@whgazetteer.org
- **GitHub Issues**: Report bugs, request features
- **Office Hours**: Weekly Q&A sessions (schedule on website)

### How can I report a bug?

1. **Check**: Is it documented in [Common Issues](common-issues.md)?
2. **Search**: GitHub issues - may already be