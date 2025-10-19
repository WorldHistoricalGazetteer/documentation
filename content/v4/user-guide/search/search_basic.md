# Basic Search

Learn how to find places in the World Historical Gazetteer using simple search queries.

## Note to Documentation Team

This page should:
- Include many screenshots showing the search interface at each step
- Have animated GIFs demonstrating search interactions
- Include common search examples that users can try
- Explain each interface element with annotated screenshots
- Show what "good results" vs "no results" looks like
- Include troubleshooting tips for common search problems
- Cross-reference Advanced Search for complex queries
- Consider a sidebar showing "search tips" throughout
- Test with actual user searches to identify common pain points
- Include accessibility notes (keyboard navigation, screen readers)

---

## Search Interface Overview

[Annotated screenshot of search interface]

The basic search interface includes:

1. **Search Box**: Enter place names, identifiers, or keywords
2. **Temporal Range Slider**: Constrain results by time period
3. **Spatial Filter Toggle**: Enable map-based spatial filtering
4. **Search Button**: Execute the search
5. **Results Summary**: Count and quality indicators
6. **Results List**: Matching subjects with preview information

## Your First Search

### Step 1: Enter a Place Name

Navigate to the search page and enter a place name in the search box.

**Examples to Try**:
- `Constantinople` - Multiple names across time
- `Paris` - Long continuous history
- `Tenochtitlan` - Pre-colonial Americas
- `Angkor` - Southeast Asian site
- `Alexandria` - Multiple places with same name

**Search Tips**:
- Start with common/well-known names
- WHG will search across all name variants automatically
- Case doesn't matter (`paris` = `Paris` = `PARIS`)
- Diacritics are handled intelligently (`Córdoba` = `Cordoba`)

### Step 2: Review Autocomplete Suggestions

As you type, WHG shows autocomplete suggestions:

[Screenshot of autocomplete dropdown]

Suggestions include:
- Matching place names
- Number of attestations
- Common time period
- Geographic region hint

**Using Autocomplete**:
- Use arrow keys to navigate suggestions
- Press Enter to select
- Click with mouse to select
- Keep typing to ignore and search freely

### Step 3: Execute the Search

Press Enter or click the Search button.

WHG searches for:
- Exact name matches
- Name variants (historical forms, translations)
- Transliterations
- Similar names (using phonetic embeddings)

### Step 4: Explore Results

Results appear in a list with preview cards:

[Screenshot of results list]

Each result card shows:
- **Primary Name**: Most common or recent name
- **Alternate Names**: Other known names (limited preview)
- **Time Range**: When this place was active/known
- **Location Preview**: Map thumbnail or coordinates
- **Attestation Count**: Number of source claims
- **Dataset Badge**: Contributing dataset(s)

## Refining Your Search

### Using the Temporal Range Slider

Constrain results to a specific time period:

[Screenshot of temporal slider]

**How to Use**:
1. Drag the left handle to set start date
2. Drag the right handle to set end date
3. Results update automatically
4. Display shows selected range (e.g., "500 BCE - 1500 CE")

**Time Period Examples**:
- Classical Antiquity: -800 to 500 CE
- Middle Ages: 500 to 1500 CE
- Early Modern: 1500 to 1800 CE
- Modern: 1800 to present

**Special Cases**:
- Prehistory: Slider goes to -3000 (adjust as needed)
- Contemporary: Set end date to "present"
- Ongoing: Places with open-ended timespans will appear in any search that overlaps their known period

**Pro Tip**: If you're unsure of exact dates, start broad and narrow down based on results.

### Enabling Spatial Filters

Click "Show Map" to enable spatial filtering:

[Screenshot of map filter interface]

**How to Use**:
1. Click "Enable Spatial Filter" checkbox
2. Draw a bounding box on the map by clicking and dragging
3. Or use the region selector dropdown (e.g., "Mediterranean", "East Asia")
4. Results update to show only places within the selected area

**Combining Filters**:
- Use temporal AND spatial filters together
- Example: "All places named 'Alexandria' in the Mediterranean region, 300 BCE - 300 CE"

## Understanding Results

### Result Ranking

Results are ranked by:
1. **Relevance**: Name match quality
2. **Temporal overlap**: How well the time range matches your query
3. **Attestation count**: More attested places rank higher
4. **Data quality**: Completeness and certainty of information

### No Results?

If your search returns no results:

**Try These Solutions**:
- Check spelling (though WHG is tolerant of variations)
- Try alternate spellings or transliterations
- Broaden the temporal range
- Remove spatial filters
- Try searching just part of the name
- Search for a related or nearby place instead

**Example**:
- Search fails: `Konstantinopel` (German spelling)
- Try instead: `Constantinople` or `Istanbul`
- Or just: `Constant*` to match variants

### Too Many Results?

If you get hundreds or thousands of results:

**Refinement Strategies**:
1. Add temporal constraints
2. Add spatial constraints
3. Be more specific: "Paris, France" not just "Paris"
4. Use Advanced Search for more precise queries
5. Sort/filter results (see below)

## Sorting and Filtering Results

### Sort Options

Change result order using the Sort dropdown:

- **Relevance** (default): Best matches first
- **Name (A-Z)**: Alphabetical by primary name
- **Date (Oldest First)**: Earliest timespans first
- **Date (Newest First)**: Most recent timespans first
- **Attestation Count**: Most attested places first
- **Recently Added**: Newly contributed data first

### Result Filters

Filter results using checkboxes/dropdowns:

**By Type**:
- [ ] Cities/Settlements
- [ ] Religious Sites
- [ ] Geographic Features
- [ ] Administrative Regions
- [ ] Battle Sites
- [ ] etc.

**By Dataset**:
- [ ] Pleiades
- [ ] CHGIS
- [ ] Your Collections
- [ ] etc.

**By Certainty**:
- [ ] High certainty only (0.8-1.0)
- [ ] Include uncertain (0.5-0.8)
- [ ] Show all including speculative (<0.5)

## Working with Individual Results

### Clicking a Result

Click any result card to open the detailed place record view.

See [Understanding Place Records](../places/understanding-records.md) for details.

### Quick Actions

Hover over a result to see quick action buttons:

- **Pin Icon**: Add to collection
- **Map Icon**: Show on map
- **Link Icon**: Copy permalink
- **Compare Icon**: Add to comparison queue
- **Export Icon**: Export this record

### Preview Information

Without clicking through, you can see:
- Primary name and key alternates
- Geographic coordinates or region
- Temporal span summary
- Number and types of attestations
- Contributing dataset(s)
- Certainty/quality indicators

## Search Tips & Tricks

### Wildcard Searches

Use `*` for wildcard matching:
- `Alex*` matches Alexandria, Alexandretta, Alexandropol, etc.
- `*grad` matches Leningrad, Stalingrad, Volgograd, etc.
- `*chester*` matches Manchester, Winchester, Rochester, etc.

### Multiple Terms

Search multiple terms to find places matching any:
- `Paris London Rome` finds all three cities
- Results are grouped by term

### Phrase Search

Use quotes for exact phrases:
- `"New York"` finds only "New York", not "New" and "York" separately
- Useful for multi-word names

### Exclude Terms

Use minus sign to exclude:
- `Paris -France` finds places named Paris except in France
- `Constantinople -Ottoman` excludes Ottoman-period attestations

**Note**: More advanced query syntax is available in [Advanced Search](advanced-search.md)

## Common Search Scenarios

### Scenario 1: Finding a Specific Known Place

**Goal**: "I want information about medieval Baghdad"

**Steps**:
1. Search: `Baghdad`
2. Set temporal range: 750 - 1500 CE
3. Click the top result
4. Explore attestations from different sources

### Scenario 2: Finding All Places with a Name

**Goal**: "How many places are called 'Springfield'?"

**Steps**:
1. Search: `Springfield`
2. Don't filter by time or space
3. Review all results
4. Note regional and temporal distributions

### Scenario 3: Exploring a Region in a Period

**Goal**: "What major cities existed in the Mediterranean, 200-400 CE?"

**Steps**:
1. Leave search box empty OR search: `city`
2. Set temporal range: 200 - 400 CE
3. Enable spatial filter
4. Draw box around Mediterranean
5. Filter results by type: "Cities"
6. Sort by attestation count

### Scenario 4: Following Name Changes

**Goal**: "What was Constantinople called before and after?"

**Steps**:
1. Search: `Constantinople`
2. Click the result
3. Navigate to the Names tab
4. Sort by timespan
5. Observe: Byzantion → Constantinople → Istanbul

## Saving Your Searches

### Save Search Query

Click "Save This Search" to:
- Name your search
- Save temporal/spatial filters
- Access later from "My Searches"
- Share with collaborators

### Export Results

Click "Export Results" to:
- Download as CSV
- Download as LPF JSON
- Download as GeoJSON
- Generate citation

See [Saving & Exporting Searches](saving-exporting.md) for details.

## Keyboard Shortcuts

Efficient searching with keyboard:

- `Ctrl/Cmd + K`: Focus search box
- `Enter`: Execute search
- `↑/↓`: Navigate autocomplete
- `Esc`: Close autocomplete
- `Tab`: Cycle through result cards
- `Enter` on result: Open full record
- `Ctrl/Cmd + F`: Find in results

See [Keyboard Shortcuts Reference](../reference/shortcuts.md) for complete list.

## Accessibility Features

WHG search is designed for accessibility:

- **Screen Reader Support**: All interface elements properly labeled
- **Keyboard Navigation**: Full functionality without mouse
- **High Contrast Mode**: Toggle in settings
- **Text Scaling**: Respects browser text size settings
- **Focus Indicators**: Clear visual focus for keyboard navigation

See [Accessibility Guide](../reference/accessibility.md) for details.

## Next Steps

**Master More Advanced Searches**:
- [Advanced Search](advanced-search.md) - Complex queries with boolean logic
- [Temporal Search](temporal-search.md) - Advanced time-based searching
- [Spatial Search](spatial-search.md) - Geographic query techniques

**Understand Your Results Better**:
- [Understanding Search Results](results.md) - Interpreting what you find
- [Working with Uncertainty](uncertainty.md) - Handling ambiguous results
- [Understanding Place Records](../places/understanding-records.md) - Detailed record anatomy

**Do More with Results**:
- [Creating Collections](../collections/creating.md) - Organize your finds
- [Exporting Data](../export/formats.md) - Use results in other tools
- [Map Visualization](../maps/interface.md) - Visualize results spatially

## Troubleshooting

### Search is Slow

- Try narrowing temporal/spatial scope
- Simplify query (fewer terms)
- Check network connection
- See [Performance Issues](../troubleshooting/performance.md)

### Results Don't Match Expectations

- Check temporal range - may be excluding relevant periods
- Check spatial filter - may be excluding relevant areas
- Try different name variants
- See [Search Problems](../troubleshooting/search-problems.md)

### Interface Not Responding

- Refresh the page
- Clear browser cache
- Try a different browser
- Report bug via [GitHub Issues]

## Frequently Asked Questions

**Q: Why don't I see modern places?**
A: Set the temporal range to include "present" (adjust right slider to maximum).

**Q: Can I search by coordinates?**
A: Yes, see [Spatial Search](spatial-search.md) for coordinate-based queries.

**Q: How do I find places near another place?**
A: Use the "Near" function in [Advanced Search](advanced-search.md).

**Q: Can I search in non-Latin scripts?**
A: Yes! WHG supports searches in original scripts. See [Working with Scripts & Languages](../advanced/languages.md).

**Q: What if I find duplicate or incorrect results?**
A: Report issues via [GitHub] or help improve by [editing](../editing/interface.md) if you have permissions.