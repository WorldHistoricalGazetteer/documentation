# Open Educational Resources (OER)

## Vision

WHG aims to elevate its educational resources from internal Lesson Plans to formal **Open Educational Resources (OER) Publications**, enhancing visibility and accessibility while participating in the broader open educational materials ecosystem.

## Strategic Goals

1. **Become a node in the Open Metadata Exchange (OME)**
    - Integration with the OME network as outlined in [WHG PLACE Issue #76](https://github.com/WorldHistoricalGazetteer/place/issues/76)
    - Enable discovery of WHG OER through federated search
    - Contribute metadata to the commons

2. **Align with OER standards and best practices**
    - Adopt Creative Commons licensing
    - Implement structured metadata (schema.org, LOM, Dublin Core)
    - Enable reuse, remix, and redistribution

3. **Increase discoverability**
    - Indexable by OER repositories (MERLOT, OER Commons, OpenStax)
    - Searchable via specialized OER search engines
    - Linked from discipline-specific resources (history, geography, digital humanities)

## Technical Requirements

### OER Metadata Schema

#### Required Fields (schema.org/Course and schema.org/LearningResource)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Mapping the Silk Road: Networks and Trade",
  "description": "A digital history lesson using WHG data to explore...",
  "courseCode": "WHG-OER-001",
  "provider": {
    "@type": "Organization",
    "name": "World Historical Gazetteer",
    "url": "https://whgazetteer.org"
  },
  "educationalLevel": ["undergraduate", "graduate"],
  "timeRequired": "PT2H",
  "inLanguage": "en",
  "learningResourceType": ["lesson plan", "tutorial", "interactive exercise"],
  "about": ["history", "geography", "digital humanities", "linked data"],
  "teaches": [
    "spatial analysis of historical trade networks",
    "working with linked place data",
    "temporal querying of historical sources"
  ],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "datePublished": "2026-03-15",
  "dateModified": "2026-04-10",
  "author": [
    {
      "@type": "Person",
      "name": "Jane Scholar",
      "affiliation": "University Example"
    }
  ],
  "hasPart": [
    {
      "@type": "CreativeWork",
      "name": "Dataset: Silk Road Cities",
      "url": "https://whgazetteer.org/datasets/12345"
    },
    {
      "@type": "CreativeWork",
      "name": "Place Collection: Trade Routes",
      "url": "https://whgazetteer.org/collections/67890"
    }
  ],
  "educationalUse": ["assignment", "group work", "research project"],
  "interactivityType": "mixed",
  "isBasedOn": {
    "@type": "CreativeWork",
    "name": "WHG Place Collection",
    "url": "https://whgazetteer.org/collections/67890"
  }
}
```

#### Open Metadata Exchange (OME) Specifics

Based on [OME documentation](https://github.com/WorldHistoricalGazetteer/place/issues/76), WHG needs:

1. **OAI-PMH Endpoint** (Open Archives Initiative Protocol for Metadata Harvesting)
   ```
   https://whgazetteer.org/oer/oai-pmh
   ```
    - Serves OER metadata in Dublin Core and schema.org formats
    - Supports selective harvesting (by date, by collection)
    - Implements resumption tokens for large result sets

2. **LOM (Learning Object Metadata) Support**
    - IEEE LOM or LOM-compatible metadata
    - Export as XML for OER repositories

3. **LRMI (Learning Resource Metadata Initiative) Properties**
    - Use schema.org/LRMI vocabulary
    - Educational alignment (to standards, competencies)
    - Accessibility metadata

### Data Model Extensions

#### New Django Model: OERPublication

```python
class OERPublication(models.Model):
    """
    Represents a publishable OER based on WHG resources
    """
    # Core metadata
    title = models.CharField(max_length=500)
    description = models.TextField()
    course_code = models.CharField(max_length=50, unique=True)  # WHG-OER-###
    
    # Educational metadata
    educational_level = ArrayField(models.CharField(max_length=50))  # undergraduate, graduate, etc.
    learning_resource_type = ArrayField(models.CharField(max_length=50))  # lesson, tutorial, etc.
    time_required = models.DurationField()  # ISO 8601 duration
    language = models.CharField(max_length=10, default='en')
    
    # Content metadata
    subject_keywords = ArrayField(models.CharField(max_length=100))
    learning_objectives = ArrayField(models.TextField())
    educational_use = ArrayField(models.CharField(max_length=50))  # assignment, group work, etc.
    interactivity_type = models.CharField(max_length=50)  # active, expositive, mixed
    
    # Licensing
    license = models.CharField(max_length=200, default='https://creativecommons.org/licenses/by/4.0/')
    is_accessible_for_free = models.BooleanField(default=True)
    
    # Authorship
    authors = models.ManyToManyField(User, related_name='oer_publications')
    organization = models.CharField(max_length=200, default='World Historical Gazetteer')
    
    # Dates
    date_published = models.DateField()
    date_modified = models.DateField(auto_now=True)
    
    # Relationships to WHG content
    based_on_collection = models.ForeignKey(Collection, null=True, blank=True)
    uses_datasets = models.ManyToManyField(Dataset)
    references_places = models.ManyToManyField(Place)
    
    # OER-specific
    oai_identifier = models.CharField(max_length=200, unique=True)  # oai:whgazetteer.org:oer:001
    educational_framework = models.CharField(max_length=200, blank=True)  # e.g., "Common Core", "ACRL"
    target_audience = ArrayField(models.CharField(max_length=100))
    
    # Files/resources
    lesson_plan_pdf = models.FileField(upload_to='oer/lesson_plans/')
    supplementary_materials = models.FileField(upload_to='oer/supplementary/', blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ])
    
    # Usage tracking
    views = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date_published']
```

### API Endpoints

#### OAI-PMH Endpoint

```
GET /oer/oai-pmh?verb=ListRecords&metadataPrefix=oai_dc
GET /oer/oai-pmh?verb=GetRecord&identifier=oai:whgazetteer.org:oer:001&metadataPrefix=oai_dc
GET /oer/oai-pmh?verb=ListIdentifiers&from=2026-01-01&until=2026-06-30
GET /oer/oai-pmh?verb=ListSets
```

#### RESTful OER API

```
GET /api/oer/                    # List all published OERs
GET /api/oer/{id}/               # Get specific OER with full metadata
GET /api/oer/{id}/schema-org/    # Get schema.org JSON-LD
GET /api/oer/{id}/lom/            # Get LOM XML
GET /api/oer/search?q=silk+road  # Search OERs
GET /api/oer/by-level/{level}/   # Filter by educational level
```

### Frontend Components

#### OER Gallery Page

```
https://whgazetteer.org/oer/
```

Features:
- Browse published OERs with rich previews
- Filter by subject, educational level, resource type
- Search across metadata
- View usage statistics
- Download in multiple formats (PDF, web, LOM, schema.org)

#### OER Detail Page

```
https://whgazetteer.org/oer/{course-code}/
```

Includes:
- Full metadata display
- Embedded lesson plan viewer
- Links to associated WHG collections/datasets
- Download options
- Citation information
- Related OERs
- Usage/remix examples (if available)
- Embedded schema.org JSON-LD for SEO

### Integration Points

#### With Existing WHG Features

1. **Collection Groups** → OER Publications
    - Outstanding student collections can be elevated to OERs
    - Instructor-created collections become lesson plans
    - Add educational metadata during elevation

2. **Place Collections** → OER Components
    - Collections serve as foundational content
    - OER wraps collection with pedagogical framing
    - Collection remains independently accessible

3. **Dataset Collections** → Case Studies
    - Multi-dataset gazetteers become research examples
    - Demonstrate data integration workflows
    - Teach reconciliation and data quality

#### With External OER Repositories

**Submission workflow:**

1. **MERLOT (Multimedia Educational Resource for Learning and Online Teaching)**
    - Manual submission with WHG OAI-PMH identifier
    - MERLOT harvests metadata
    - WHG page becomes authoritative source

2. **OER Commons**
    - API-based submission
    - Metadata push via OER Commons API
    - Automatic updates on revision

3. **OpenStax**
    - Partner integration for discipline-specific resources
    - History and Geography sections

4. **Discipline-specific repositories**
    - H-Net (History)
    - AAG (Geography)
    - DHCommons (Digital Humanities)

### Workflow for Creating OERs

```
graph TD
    A[Instructor creates Collection] --> B[Request OER elevation]
    B --> C[WHG Staff Review]
    C --> D{Approved?}
    D -->|Yes| E[Add educational metadata]
    D -->|No| F[Provide feedback]
    F --> A
    E --> G[Generate lesson plan template]
    G --> H[Instructor completes pedagogy]
    H --> I[WHG editorial review]
    I --> J{Publish?}
    J -->|Yes| K[Publish as OER]
    J -->|No| F
    K --> L[Register with OME]
    L --> M[Submit to OER repositories]
    M --> N[Monitor usage]
```

### Technical Implementation Checklist

**Phase 1: Foundation (Months 1-2)**
- [ ] Design and implement OERPublication model
- [ ] Create OER admin interface
- [ ] Build OER gallery frontend
- [ ] Implement schema.org JSON-LD embedding

**Phase 2: Metadata Infrastructure (Months 3-4)**
- [ ] Implement OAI-PMH endpoint
- [ ] Add LOM export functionality
- [ ] Create LRMI metadata generator
- [ ] Build OER API endpoints

**Phase 3: Integration (Months 5-6)**
- [ ] Connect Collections to OER elevation workflow
- [ ] Build instructor submission interface
- [ ] Implement editorial review queue
- [ ] Create usage tracking dashboard

**Phase 4: External Registration (Months 7-8)**
- [ ] Register with Open Metadata Exchange
- [ ] Test OAI-PMH harvesting
- [ ] Submit to MERLOT
- [ ] Submit to OER Commons
- [ ] Document API for partners

**Phase 5: Community & Growth (Ongoing)**
- [ ] Recruit OER authors
- [ ] Host OER development workshops
- [ ] Build community showcase
- [ ] Track impact metrics

### Success Metrics

**Discoverability:**
- Number of OER repositories indexing WHG resources
- Search engine referrals to OER pages
- OAI-PMH harvest requests per month

**Usage:**
- OER page views
- Lesson plan downloads
- API requests for OER metadata
- Remixes/derivatives created

**Community:**
- Number of published OERs
- Number of contributing instructors
- Instructor satisfaction scores
- Student collection elevations

### Sustainability Considerations

**Content Maintenance:**
- Annual review of published OERs
- Update outdated examples
- Refresh links to WHG collections (may have been updated)
- Revise based on user feedback

**Technical Maintenance:**
- Monitor OAI-PMH endpoint uptime
- Update metadata schemas as standards evolve
- Maintain compatibility with OER repository harvesters
- Archive retired OERs (but keep metadata harvestable)

**Funding:**
- Seek OER grants (e.g., Hewlett Foundation, Creative Commons)
- Partner with libraries and academic institutions
- Integrate with library OER programs

### Documentation Needs

**For Instructors:**
- "How to Elevate Your Collection to an OER"
- "Writing Learning Objectives for WHG OERs"
- "Choosing the Right Creative Commons License"

**For Developers:**
- "OAI-PMH API Documentation"
- "Integrating WHG OER into Your LMS"
- "Harvesting WHG Metadata for OER Aggregators"

**For Administrators:**
- "OER Review and Approval Guidelines"
- "Managing OER Lifecycle"
- "Monitoring OER Impact"