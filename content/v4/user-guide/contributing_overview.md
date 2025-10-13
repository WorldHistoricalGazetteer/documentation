# Contributing Data Overview

How to contribute your historical place data to the World Historical Gazetteer.

## Note to Documentation Team

Critical page - this is the gateway for contributors. Consider:
- Clear value proposition: why contribute to WHG?
- Address common concerns: licensing, credit, control, corrections
- Flowchart showing contribution pathways (one-time vs ongoing, small vs large)
- Video walkthrough of contribution process
- Examples of successful contributions with metrics
- Link to contributor testimonials if available
- Clear information about data licensing and usage
- Contact information for pre-contribution consultation
- Requirements checklist that contributors can print/save
- Set realistic expectations about timeline and review process
- Explain the difference between contributing new data vs improving existing data
- Address institutional vs individual contributors

---

## Why Contribute to WHG?

### For Researchers

- **Increase discoverability** of your research data
- **Enable reuse** of your hard-won place name research
- **Get cited** - contributions are formally citable with DOIs
- **Build on others' work** - link your data to existing place records
- **Support the community** - help build shared infrastructure
- **Meet funder requirements** for data sharing and public access

### For Projects & Institutions

- **Preserve** project data beyond grant period
- **Integrate** with global historical place infrastructure
- **Enhance visibility** for your institution's collections
- **Enable discovery** across datasets and projects
- **Reduce duplication** - reconcile with existing data
- **Long-term sustainability** - WHG maintains your contribution

### For Everyone

- **Open access** - your data helps researchers worldwide
- **Quality infrastructure** - professional curation and hosting
- **Temporal awareness** - WHG preserves historical nuance
- **Source attribution** - proper credit and provenance tracking

## What Can You Contribute?

### Contribution Types

WHG accepts several types of contributions:

#### 1. Place Datasets

**Description**: Collections of historical places with names, locations, and temporal information.

**Examples**:
- Gazetteer from a published historical atlas
- Place names extracted from medieval itineraries
- Archaeological site catalog with coordinates
- Prosopographical database with places of origin
- Digital edition linking textual place references

**Typical Size**: 10 to 100,000+ places

**See**: [Contribution Types](contributions.html) in Data Model documentation

#### 2. Place Corrections & Enhancements

**Description**: Improvements to existing WHG place records.

**Examples**:
- Adding missing name variants
- Correcting geometric errors
- Refining temporal bounds
- Adding source citations
- Clarifying ambiguous classifications

**Typical Size**: Individual edits to existing records

**See**: [Editing Interface](../editing/interface.md)

#### 3. Networks

**Description**: Sets of connected places representing historical networks.

**Examples**:
- Trade route networks
- Religious institutional networks
- Political alliance networks
- Communication networks

**Typical Size**: 10-500 places with relationship data

**See**: [Working with Networks](networks.md)

#### 4. Routes & Itineraries

**Description**: Ordered sequences of places representing journeys or routes.

**Examples**:
- Pilgrimage routes (e.g., Camino de Santiago segments)
- Exploration voyages (e.g., Ibn Battuta's travels)
- Military campaigns
- Trade caravan routes

**Typical Size**: 5-100 places in sequence

**See**: [Working with Routes & Itineraries](routes.md)

#### 5. Thematic Collections

**Description**: Curated sets of places grouped by research theme.

**Examples**:
- Places mentioned in a specific text
- Sites associated with a historical figure
- Locations relevant to a research project
- Teaching collection for a course

**Typical Size**: 5-1000 places

**See**: [Creating Collections](../collections/creating.md)

## Contribution Pathways

### Path 1: Small Direct Contributions (1-50 places)

**Best For**: Individual researchers, small datasets, teaching projects

**Process**:
1. Create WHG account
2. Use web interface to add places one-by-one OR upload small file
3. Enter place details via forms
4. Submit for review
5. Publication after light review

**Timeline**: 1-2 weeks

**Effort**: Low - guided interface

### Path 2: Medium Batch Upload (50-1000 places)

**Best For**: Dissertation data, book gazetteers, regional surveys

**Process**:
1. Create WHG account
2. Prepare data file (CSV or JSON)
3. Upload via web interface
4. Use reconciliation tools to link with existing places
5. Review validation warnings
6. Submit for review
7. Publication after standard review

**Timeline**: 2-6 weeks

**Effort**: Medium - file preparation and reconciliation

### Path 3: Large Dataset Partnership (1000+ places)

**Best For**: Major projects, institutional collections, authoritative gazetteers

**Process**:
1. Contact WHG team before beginning
2. Collaborative planning of data model mapping
3. Prepare data with WHG team consultation
4. Technical validation and quality assessment
5. Reconciliation (may be iterative)
6. Phased ingestion with monitoring
7. Publication with announcement

**Timeline**: 2-6 months

**Effort**: High - requires planning and collaboration

**Contact**: partnerships@whgazetteer.org

### Path 4: Ongoing Data Feed

**Best For**: Actively maintained gazetteers, institutional databases

**Process**:
1. Partnership agreement with WHG
2. API integration setup
3. Automated regular updates
4. Continuous quality monitoring
5. WHG team provides ongoing support

**Timeline**: 3-6 months initial setup

**Effort**: High initially, then low ongoing

**Contact**: partnerships@whgazetteer.org

## Contribution Requirements

### Minimum Requirements

To contribute data to WHG, you must provide:

**Essential Fields**:
- [ ] At least one name for each place
- [ ] At least one source citation
- [ ] At least rough spatial information (coordinates or region)
- [ ] Some temporal context (century-level is acceptable)

**Legal/Ethical**:
- [ ] Right to contribute the data (own it, have permission, or it's public domain)
- [ ] Agreement to WHG terms of use
- [ ] Appropriate licensing (open preferred)

### Recommended Fields

For higher quality contributions, also provide:

- [ ] Multiple name variants (historical, multilingual)
- [ ] Precise geometries (polygons where appropriate)
- [ ] Detailed temporal bounds with uncertainty indicators
- [ ] Multiple source citations
- [ ] Place type classifications
- [ ] Relations to other places
- [ ] Certainty assessments
- [ ] Contextual notes

### Optional Enhancements

Going above and beyond:

- [ ] Non-Latin scripts for names
- [ ] Transliterations and IPA pronunciation
- [ ] Detailed provenance notes
- [ ] Network/relationship data
- [ ] Images or external links
- [ ] Bibliographic metadata

See [Data Formats](formats.md) for detailed specifications.

## Data Licensing

### Your Rights

When you contribute data to WHG:

- **You retain copyright** to your original data
- **You grant WHG permission** to host, display, and distribute your data
- **You receive attribution** - contributions are credited to you
- **You can update** your contributions at any time
- **You cannot delete** after publication (but can mark as deprecated)

### Recommended Licenses

WHG strongly recommends open licensing:

- **CC0 (Public Domain)**: Maximum openness, no restrictions
- **CC BY (Attribution)**: Requires attribution, very open
- **CC BY-SA (Attribution-ShareAlike)**: Requires attribution and sharing derivatives under same license

**Why Open?**: Maximizes research impact and data reuse

### Data Usage

WHG-hosted data can be:
- Searched and viewed by anyone
- Downloaded for research and educational use
- Accessed via API
- Integrated into other projects (per license terms)
- Cited in publications

## Quality Standards

WHG maintains quality through:

### Automated Validation

- Format checking (valid coordinates, dates, etc.)
- Completeness checking (required fields present)
- Consistency checking (logical relationships)
- Duplicate detection

### Peer Review

- WHG staff review all contributions
- Subject matter experts review large datasets
- Community flagging of potential issues

### Quality Metrics

Each contribution receives:
- Completeness score
- Consistency rating
- Source citation density
- Community trust indicators

**Don't Worry**: We'll help you improve quality. Initial submissions don't need to be perfect.

## The Contribution Process (Step-by-Step)

### Step 1: Prepare Your Data

See [Preparing Your Data](preparation.md) for detailed guidance.

**Key Activities**:
- Clean and format your data
- Map to WHG data model
- Gather source citations
- Document temporal and spatial information

**Time**: Varies widely (days to months)

### Step 2: Upload Your Data

See [Upload Methods](upload.md) for technical details.

**Options**:
- Web form (for small datasets)
- File upload (CSV, JSON, GeoJSON)
- API submission (for technical users)

**Time**: Minutes to hours

### Step 3: Validation

WHG automatically validates your submission.

**What Happens**:
- Format checking
- Error reporting
- Warning flagging
- Suggestions for improvement

**Your Action**: Fix errors, consider warnings

**Time**: Minutes to days

### Step 4: Reconciliation

Link your places to existing WHG records.

See [Reconciliation Process](reconciliation.md) for details.

**What Happens**:
- WHG suggests potential matches
- You review and confirm/reject
- Linked places inherit relationships and context

**Why This Matters**: Reconciliation creates a connected knowledge graph

**Time**: Hours to weeks (depending on dataset size)

### Step 5: Review

WHG staff review your contribution.

**What's Checked**:
- Data quality
- Appropriate licensing
- Source citations
- Temporal/spatial plausibility
- Model compliance

**Possible Outcomes**:
- **Approved**: Move to publication
- **Revisions Requested**: You make changes and resubmit
- **Consultation Needed**: WHG team contacts you to discuss

**Time**: 1-4 weeks

### Step 6: Publication

Your data goes live on WHG.

**What Happens**:
- Data is indexed and searchable
- You receive notification
- DOI is minted for citation
- Contribution appears in your profile

**Post-Publication**: You can continue to edit and enhance

## Getting Help

### Pre-Contribution Consultation

Not sure if your data is suitable? Want guidance on preparation?

**Contact**: contribute@whgazetteer.org

We're happy to:
- Review sample data
- Advise on data modeling
- Provide technical guidance
- Discuss partnership opportunities

### During Contribution

Having trouble with upload or reconciliation?

**Resources**:
- [Troubleshooting Upload Problems](../troubleshooting/upload-problems.md)
- [FAQ](../troubleshooting/faq.md)
- Community forum
- Email support

### Documentation

Detailed guidance available:
- [Preparing Your Data](preparation.md)
- [Data Formats](formats.md)
- [Upload Methods](upload.md)
- [Reconciliation Process](reconciliation.md)
- [Best Practices](best-practices.md)

## Recognition & Citation

### How Your Contribution is Credited

- **Dataset Page**: Shows contributors, institutions, sources
- **Individual Records**: Attribution on each place record
- **Search Results**: Dataset badges show source
- **API Responses**: Include contributor metadata
- **DOI**: Formal citeable identifier

### Citing WHG Contributions

You can cite your contribution:

```
Author(s). (Year). Dataset Title [Data set]. World Historical Gazetteer. 
https://doi.org/10.xxxxx/whg.dataset.xxxxx
```

See [Citation & Attribution](../export/citation.md) for details.

## Examples of Contributions

### Case Study 1: Medieval Pilgrimage Routes

**Contributor**: Dr. [Name], [University]

**Type**: Route dataset

**Size**: 47 places across 3 pilgrimage routes

**Format**: CSV upload

**Timeline**: 2 weeks from preparation to publication

**Impact**: 450+ searches, 12 citations in first year

### Case Study 2: Ancient Mesopotamian Cities

**Contributor**: [Archaeological Project]

**Type**: Place dataset with network relations

**Size**: 312 settlements, 1,200 name variants

**Format**: LPF JSON via API

**Timeline**: 3 months including consultation and reconciliation

**Impact**: Integrated with 4 other datasets, featured in 2 publications

### Case Study 3: Silk Road Trading Posts

**Contributor**: [Research Institute]

**Type**: Network dataset

**Size**: 89 places with 156 connection relationships

**Format**: GeoJSON with custom properties

**Timeline**: 6 weeks with iterative reconciliation

**Impact**: Used in 3 courses, downloaded 200+ times

More examples: [Case Studies](../tutorials/case-studies.md)

## Next Steps

Ready to contribute?

**Start Here**:
1. [Create an account](../getting-started/account.md) if you haven't already
2. Read [Preparing Your Data](preparation.md)
3. Review [Data Formats](formats.md)
4. Check [Best Practices](best-practices.md)
5. Begin your contribution!

**Not Sure Yet**?
- Browse [Public Datasets](../collections/public-datasets.md) to see examples
- Read the [FAQ](../troubleshooting/faq.md)
- Contact us: contribute@whgazetteer.org

**Want to Start Small**?
- Try [editing an existing record](../editing/interface.md)
- Create a [personal collection](../collections/creating.md)
- Explore [reconciliation](../reconciliation/overview.md) with sample data