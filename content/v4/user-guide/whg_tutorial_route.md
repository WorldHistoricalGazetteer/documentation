# Tutorial: Creating a Historical Route

Learn by doing: create and publish a historical route in WHG using Ibn Battuta's journey from Tangier to Cairo as an example.

## Note to Documentation Team

Tutorials are critical for onboarding. This page should:
- Be completely self-contained and walkable start-to-finish
- Include screenshots at EVERY step with clear annotations
- Provide sample data users can copy/paste
- Show expected results vs common mistakes
- Include time estimates for each section
- Have video walkthrough companion
- Test with actual new users and iterate
- Provide downloadable sample dataset
- Show both successful completion and troubleshooting
- Link to real WHG records that users can explore
- Consider interactive/guided version in the UI
- Include "checkpoints" where users can verify progress
- End with "next steps" for continued learning

---

## Tutorial Overview

**What You'll Learn**:
- Preparing route data
- Uploading to WHG
- Reconciling places
- Adding temporal and source information
- Visualizing routes on the map
- Publishing your contribution

**Time Required**: 45-60 minutes

**Prerequisites**:
- WHG account ([create one](../getting-started/account.md))
- Basic spreadsheet skills
- Web browser (Chrome, Firefox, Safari, or Edge)

**Example Route**: Ibn Battuta's journey from Tangier to Cairo (1325 CE), a well-documented segment of his larger travels.

## Step 1: Understanding Your Route (5 minutes)

### What is a Route?

A **route** in WHG is an ordered sequence of places connected by travel. Unlike generic networks, routes have:
- **Sequence**: Places are visited in order (1, 2, 3...)
- **Direction**: Movement from place to place
- **Temporal context**: When the journey occurred
- **Provenance**: Source(s) documenting the route

### Our Example: Ibn Battuta's Journey

**Context**: 
- Traveler: Ibn Battuta (1304-1368/1369)
- Journey: Pilgrimage from Tangier to Mecca, 1325-1326
- Segment: Tangier → Fez → Tlemcen → Algiers → Tunis → Cairo
- Source: *Rihla* (travel narrative), written ~1355

**Why This Example?**:
- Well-documented historical route
- Manageable number of places (6 cities)
- Good test of reconciliation (famous cities likely in WHG)
- Demonstrates temporal context
- Shows how to cite historical sources

## Step 2: Preparing Your Data (15 minutes)

### Download the Template

Download this CSV template and open in Excel/Google Sheets:

[Link to downloadable template]

Or create your own CSV with these columns:

```csv
place_name,latitude,longitude,sequence,start_year,end_year,source,notes
```

### Fill in Your Route Data

Copy this data into your spreadsheet:

```csv
place_name,latitude,longitude,sequence,start_year,end_year,source,notes
Tangier,35.7595,-5.8340,1,1325,1325,Ibn Battuta Rihla c.1355,Starting point of journey
Fez,34.0181,-5.0078,2,1325,1325,Ibn Battuta Rihla c.1355,Stayed several months
Tlemcen,34.8919,-1.3150,3,1325,1325,Ibn Battuta Rihla c.1355,Brief stop
Algiers,36.7372,3.0865,4,1325,1325,Ibn Battuta Rihla c.1355,Coastal route
Tunis,36.8065,10.1815,5,1325,1325,Ibn Battuta Rihla c.1355,Important stop
Cairo,30.0444,31.2357,6,1326,1326,Ibn Battuta Rihla c.1355,Destination for this segment
```

### Understanding the Columns

**place_name**: Name of the place as you know it
- Use recognizable modern or historical names
- WHG will help match to standardized names

**latitude, longitude**: Coordinates (WGS84)
- Approximate is fine for historical routes
- WHG will reconcile to existing geometries

**sequence**: Order of places on route (1, 2, 3...)
- Must be integers
- Sequential but gaps OK (can be 1, 2, 5, 8...)

**start_year, end_year**: When the traveler was at this place
- Can be same year if brief
- Precision to year is fine

**source**: Citation for this information
- Brief but clear
- Will be expanded in WHG interface

**notes**: Additional context (optional)
- Travel details
- Historical significance
- Uncertainties

### Validate Your Data

**Check**:
- [ ] All place names spelled consistently
- [ ] Coordinates are reasonable (Tangier is in Morocco, not Mongolia!)
- [ ] Sequence numbers are in order
- [ ] Years make sense (1325-1326, not 2025)
- [ ] Source is cited
- [ ] No empty required fields

**Common Mistakes**:
- ❌ Longitude/latitude swapped
- ❌ Negative signs missing (Western hemisphere, Southern hemisphere)
- ❌ Decimal point errors (30.0444, not 300.444)
- ❌ Sequence out of order

### Save Your File

Save as: `ibn_battuta_route_segment.csv`

**Important**: Save as CSV (Comma-Separated Values), not Excel format

## Step 3: Upload to WHG (10 minutes)

### Navigate to Upload Interface

1. Log into WHG
2. Click **"Contribute"** in top navigation
3. Select **"Upload New Dataset"**
4. Choose **"Route/Itinerary"** as contribution type

[Screenshot: Upload interface with "Route" option highlighted]

### Fill in Dataset Metadata

**Dataset Title**: `Ibn Battuta: Tangier to Cairo (1325-1326)`

**Description**:
```
First segment of Ibn Battuta's famous journey to Mecca, traveling 
along North Africa's Mediterranean coast from Tangier to Cairo. 
Based on his travel narrative (Rihla) written circa 1355.
```

**Temporal Extent**: 
- Start: 1325
- End: 1326

**Geographic Extent**: North Africa

**License**: CC-BY (or your preference)

**Dataset Type**: Route/Itinerary ✓

**Public**: ☐ (uncheck for now - we'll make public after review)

### Upload Your CSV

1. Click **"Choose File"**
2. Select `ibn_battuta_route_segment.csv`
3. Click **"Upload"**

[Screenshot: File upload interface]

### Wait for Initial Validation

WHG will automatically:
- Check file format ✓
- Validate required fields ✓
- Parse coordinates ✓
- Check sequence ordering ✓

**Expected result**: ✅ "File validated successfully"

**If errors**: See [Upload Problems](../troubleshooting/upload-problems.md)

## Step 4: Review and Map Columns (5 minutes)

WHG will show a preview of your data and ask you to confirm column mappings.

### Verify Column Mappings

[Screenshot: Column mapping interface]

**WHG detected**:
- `place_name` → Name ✓
- `latitude` → Latitude ✓
- `longitude` → Longitude ✓
- `sequence` → Route Sequence ✓
- `start_year` → Timespan Start ✓
- `end_year` → Timespan Stop ✓
- `source` → Source Citation ✓
- `notes` → Notes ✓

**Action**: Click **"Confirm Mappings"**

### Preview Your Route

WHG displays:
- Map showing all 6 places
- Route line connecting them in sequence
- Data table with all fields

[Screenshot: Route preview map]

**Check**:
- [ ] Places are in correct geographic locations
- [ ] Route line follows expected path
- [ ] Sequence numbers are displayed correctly

**Looks good?** Click **"Proceed to Reconciliation"**

## Step 5: Reconciliation (15 minutes)

This is the most important step! We'll match your places to existing WHG records.

### What is Reconciliation?

WHG will search for existing records matching your places. When matches are found:
- Your route links to established place records
- Your route inherits additional context (alt names, precise coordinates, etc.)
- Your contribution adds to the place's history

### Review Match Suggestions

For each place, WHG suggests potential matches with confidence scores.

#### Place 1: Tangier

[Screenshot: Reconciliation interface showing Tangier matches]

**Your Record**:
```
Name: Tangier
Coordinates: 35.7595°N, 5.8340°W
Time: 1325
```

**Top Match** (Score: 0.96):
```
WHG ID: whg:123456
Primary Name: Tangier / Tangiers / طنجة
Coordinates: 35.7595°N, 5.8340°W (±1km)
Active: 800 BCE - present
Type: City, Port
Sources: 12 datasets
```

**Evidence**:
- ✅ Name match: "Tangier" (exact)
- ✅ Coordinates: <1km apart
- ✅ Temporal overlap: 1325 within 800 BCE - present
- ✅ Type compatible: City

**Decision**: ✅ **ACCEPT** (Click "Accept Match")

**Why?**: High confidence, all evidence aligns, this is clearly the same Tangier

#### Place 2: Fez

**Top Match** (Score: 0.94):
```
WHG ID: whg:234567
Primary Name: Fez / Fès / فاس
Coordinates: 34.0181°N, 5.0078°W (±500m)
Active: 789 CE - present
Type: Imperial Capital, City
```

**Decision**: ✅ **ACCEPT**

#### Place 3: Tlemcen

**Top Match** (Score: 0.89):
```
WHG ID: whg:345678
Primary Name: Tlemcen / تلمسان
Coordinates: 34.8919°N, 1.3150°W (±2km)
Active: 100 BCE - present
Type: City
```

**Decision**: ✅ **ACCEPT**

**Note**: Slightly lower score due to coordinate uncertainty, but clearly the same city

#### Place 4: Algiers

**Top Match** (Score: 0.98):
```
WHG ID: whg:456789
Primary Name: Algiers / Alger / الجزائر
Coordinates: 36.7372°N, 3.0865°E (±500m)
Active: 944 CE - present
Type: City, Port
```

**Decision**: ✅ **ACCEPT**

#### Place 5: Tunis

**Top Match** (Score: 0.97):
```
WHG ID: whg:567890
Primary Name: Tunis / تونس
Coordinates: 36.8065°N, 10.1815°E (±1km)
Active: 2000 BCE - present
Type: Capital City
```

**Decision**: ✅ **ACCEPT**

#### Place 6: Cairo

**Top Match** (Score: 0.93):
```
WHG ID: whg:678901
Primary Name: Cairo / القاهرة
Coordinates: 30.0444°N, 31.2357°E (±2km)
Active: 969 CE - present
Type: Capital City
```

**Second Match** (Score: 0.75):
```
WHG ID: whg:678902
Primary Name: Fustat / الفسطاط
Coordinates: 30.01°N, 31.23°E
Active: 641 - 1168 CE
Type: Historical City
```

[Screenshot: Two Cairo matches shown]

**Analysis**:
- First match: Modern Cairo (founded 969 CE) - ✅ was major city in 1326
- Second match: Fustat (old Cairo) - also relevant but distinct place

**Decision**: ✅ **ACCEPT first match (Cairo)**

**Note**: Fustat is related but distinct. Ibn Battuta would have visited the Cairo of his time (which existed in 1326).

### Complete Reconciliation

**Summary**:
- 6 places in your route
- 6 matches accepted (100%)
- 0 rejected
- 0 deferred
- 0 new places to create

**Action**: Click **"Complete Reconciliation"**

## Step 6: Enhance Your Contribution (10 minutes)

Now we'll add richer metadata to make your route more valuable.

### Add Route-Level Metadata

**Route Name**: Ibn Battuta's Pilgrimage: Tangier to Cairo

**Route Type**: Pilgrimage (from dropdown)

**Additional Description**:
```
First segment of Ibn Battuta's famous Hajj journey (1325-1354). 
This North African coastal route was common for Maghrebi pilgrims 
traveling to Mecca. Ibn Battuta was 21 years old when he began 
this journey from his hometown of Tangier.
```

**Primary Source**:
- Title: *Rihla* (The Journey / Travels)
- Author: Ibn Battuta (Muhammad ibn Battuta)
- Date: c. 1355
- Note: Dictated to Ibn Juzayy upon Ibn Battuta's return

**Secondary Sources** (optional but recommended):
- Gibb, H.A.R. (trans). *The Travels of Ibn Battuta*. Cambridge, 1958.
- Dunn, Ross E. *The Adventures of Ibn Battuta*. University of California Press, 2005.

### Add Connection-Level Details

For each leg of the route, you can add:

**Leg 1: Tangier → Fez**
- Distance: ~240 km
- Travel time: "Several days" (Ibn Battuta stayed in Fez for months)
- Mode: Foot, possibly horse/camel
- Notes: "Traveled with a caravan for safety"

**Leg 2: Fez → Tlemcen**
- Distance: ~450 km
- Notes: "Passed through several smaller settlements"

**Leg 3: Tlemcen → Algiers**
- Distance: ~500 km
- Mode: Coastal route

**Leg 4: Algiers → Tunis**
- Distance: ~800 km
- Notes: "Married first wife in Tunis, stayed two months"

**Leg 5: Tunis → Cairo**
- Distance: ~2,400 km
- Mode: Coastal then inland
- Notes: "Traveled with large caravan; journey took several months"

**Time to add all details**: Optional but enriching. Can add now or later.

## Step 7: Set Certainty Levels (5 minutes)

For each leg, assess your certainty:

**Tangier → Fez**: 0.95 (Certain)
- Reason: Explicitly stated in Rihla, well-documented

**Fez → Tlemcen**: 0.90 (High Certainty)
- Reason: Route clearly described

**Tlemcen → Algiers**: 0.85 (Probable)
- Reason: Described but some scholarly debate about exact path

**Algiers → Tunis**: 0.90 (High Certainty)
- Reason: Well-documented, coastal route straightforward

**Tunis → Cairo**: 0.95 (Certain)
- Reason: Major leg, extensively described

### Why Set Certainty?

**Benefits**:
- Alerts users to ambiguities
- Distinguishes well-documented vs reconstructed routes
- Enables filtering by certainty
- Scholarly honesty

## Step 8: Preview and Submit (5 minutes)

### Review Your Complete Route

WHG shows a final preview:

[Screenshot: Complete route preview]

**Map View**:
- 6 cities marked with sequence numbers
- Route line colored by certainty (darker = more certain)
- Timeline slider showing 1325-1326

**Data View**:
- Table of all places with full metadata
- Connection details
- Sources

**Check**:
- [ ] Map looks correct
- [ ] Sequence is right (1→2→3→4→5→6)
- [ ] Dates make sense
- [ ] Sources are cited
- [ ] No typos in descriptions

###  Add Tags (Optional)

Tags help discoverability:
- `pilgrimage`
- `Islamic_history`
- `14th_century`
- `North_Africa`
- `Ibn_Battuta`
- `Mediterranean`

### Choose Visibility

For this tutorial:
- ☑ Make Public (so others can see)
- ☑ Allow Comments
- ☐ Featured (request to be featured - WHG staff decides)

### Submit for Review

Click **"Submit for Review"**

**What Happens Next**:
1. WHG staff review your contribution (1-2 weeks)
2. You receive email notification of approval or revision requests
3. Upon approval, route goes live
4. You can edit anytime after publication

## Step 9: After Submission

### Check Your Dashboard

Navigate to **My Contributions**:
- Status: "Under Review"
- Submitted: [today's date]
- Type: Route
- Places: 6
- Estimated review: 1-2 weeks

### What Reviewers Check

- **Data quality**: Coordinates reasonable, dates logical
- **Sources**: Properly cited
- **Reconciliation**: Matches are appropriate
- **Completeness**: Required fields present
- **Consistency**: Data internally consistent

**Most submissions approved** with minor suggestions

### If Revisions Requested

You'll receive email with feedback:
- Specific issues to address
- Suggestions for improvement
- Deadline for revisions (usually 2 weeks)

**Action**: Make requested changes, resubmit

### Upon Approval

You'll receive notification:
- ✅ Route is now live and searchable
- 🔗 Link to view your published route
- 📊 DOI for citation
- 🎉 Congratulations!

## Step 10: Explore Your Published Route (After Approval)

### View Your Route

Navigate to your route's public page:

**URL**: `https://whgazetteer.org/routes/[your-route-id]`

**Page includes**:
- Interactive map with animation
- Timeline slider (drag to see route progress)
- Place details (click markers)
- Source citations
- Download options
- Share buttons

### Map Features to Try

**1. Play Animation**:
- Click play button
- Watch Ibn Battuta's journey unfold over time
- Speed adjustable

**2. Click Places**:
- See full place records
- Explore alternate names
- View other routes through this place

**3. View in Context**:
- Toggle other 14th-century routes
- See contemporary events
- Explore regional context

### Share Your Work

**Options**:
- Direct link (copy URL)
- Social media (Twitter, Facebook buttons)
- Embed in website/blog (get embed code)
- Download (for presentations, papers)
- Cite (get formatted citation)

### Citation Format

```
[Your Name]. (2024). Ibn Battuta's Pilgrimage: Tangier to Cairo 
(1325-1326) [Route dataset]. World Historical Gazetteer. 
https://doi.org/10.xxxxx/whg.route.xxxxx
```

## Next Steps: Level Up Your Skills

### Create More Complex Routes

**Try**:
- Longer routes (20+ places)
- Branching itineraries
- Round-trip journeys
- Multi-year expeditions

### Add More Detail

**Enhance with**:
- Daily travel logs
- Distances and travel times
- Elevation profiles
- Weather/seasonal info
- Companions and events

### Connect to Networks

**Expand your contribution**:
- Link to trade networks
- Connect to contemporary routes
- Add related places not on main route
- Create route collections

### Advanced Techniques

**Learn about**:
- Uncertainty visualization
- Alternative route proposals
- Comparing routes
- Route analysis tools

See: [Advanced Route Techniques](../advanced/routes-advanced.md)

## Troubleshooting

### "Reconciliation found no matches"

**Causes**:
- Place names spelled unusually
- Coordinates significantly off
- Place not yet in WHG

**Solutions**:
- Try alternate name spellings
- Check coordinates
- Create new place record if needed

See: [Reconciliation Problems](../troubleshooting/reconciliation-problems.md)

### "Invalid sequence numbers"

**Causes**:
- Duplicates (two places marked "3")
- Non-integers (3.5)
- Negative numbers

**Solution**: Review sequence column, ensure integers 1, 2, 3...

### "Temporal inconsistency"

**Causes**:
- End year before start year
- Dates don't align with sequence
- Impossible travel times

**Solution**: Check dates make sense for the route

## Congratulations!

You've successfully:
- ✅ Prepared route data
- ✅ Uploaded to WHG
- ✅ Reconciled places
- ✅ Added rich metadata
- ✅ Submitted for review
- ✅ Published historical contribution

**Your contribution**:
- Helps researchers find Ibn Battuta's route
- Links to broader travel history
- Enables comparative route studies
- Preserves historical geographic knowledge

## Resources

**Related Tutorials**:
- [Building a Trade Network](network-tutorial.md)
- [Contributing a Dataset](dataset-contribution.md)
- [Temporal Research Workflow](temporal-workflow.md)

**Documentation**:
- [Routes & Itineraries Guide](../maps/routes.md)
- [Reconciliation Overview](../reconciliation/overview.md)
- [Contributing Best Practices](../contributing/best-practices.md)

**Get Help**:
- Community Forum
- Email: routes@whgazetteer.org
- Office Hours: Wednesdays 2-3pm ET

**Share Your Success**:
- Tweet with #WHGazetteer
- Blog about your experience
- Help others in the forum