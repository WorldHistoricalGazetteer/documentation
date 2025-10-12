# Part 2: Vocabularies

## 1. Subject Classification Vocabulary

Subjects are classified via attestations with `relation_type: "has_type"`. The following classification values are recognized for contribution types:

### 1.1 Contribution Type Classifications

| Classification | Definition | Example Uses |
|----------------|------------|--------------|
| `gazetteer` | A dataset of places from a common context | Historical maps, archaeological surveys, administrative registers |
| `route` | A sequentially-ordered set of places | Silk Road, Roman roads, maritime routes, pilgrimage paths |
| `itinerary` | A route with temporal dimensions | Travel diaries, military campaigns, migration paths, voyage logs |
| `network` | A dataset of connections between places | Trade networks, postal systems, diplomatic relations, communication infrastructure |
| `gazetteer_group` | A thematic collection of gazetteers | Ancient World collection, Colonial archives, Environmental history datasets |
| `period` | A temporal entity with chrononym and geographic extent | Dynasties, eras, cultural periods, geological epochs |

### 1.2 GeoNames Feature Classes

WHG also supports GeoNames feature class vocabulary for finer-grained place classification:

**Major classes:**
- `A`: Administrative boundaries (A.ADM1, A.ADM2, A.PCLI, etc.)
- `P`: Populated places (P.PPLA, P.PPL, P.PPLC, etc.)
- `H`: Hydrographic features (H.STM, H.LK, H.BAY, etc.)
- `L`: Area features (L.RGN, L.AREA, L.PRK, etc.)
- `R`: Roads/railroads (R.RD, R.TRL, R.RR, etc.)
- `S`: Sites (S.ARCH, S.CSTL, S.MSTY, S.CH, etc.)
- `T`: Hypsographic features (T.MT, T.PK, T.ISL, etc.)
- `U`: Undersea features
- `V`: Vegetation (V.FRST, V.GRSLD, etc.)

Full GeoNames feature code list: http://www.geonames.org/export/codes.html

---

## 2. Name Type Vocabulary

Names can serve multiple semantic functions. The `name_type` field is an array that can contain any combination of the following values:

| Name Type | Definition | Examples |
|-----------|------------|----------|
| **toponym** | Geographic place name (includes all geographic features) | "Chang'an" 長安, "Nile", "Mount Fuji" 富士山, "Mediterranean Sea" |
| **chrononym** | Period or era name | "Tang Dynasty", "Bronze Age", "Edo Period", "Victorian Era" |
| **ethnonym** | Name of a people or ethnic group | "Swahili", "Maya", "Hellenes", "Haudenosaunee" |
| **hagionym** | Name of a sacred site or religious place | "Mecca" مكة, "Bodh Gaya", "Jerusalem", "Angkor Wat" |
| **demonym** | Name for inhabitants of a place | "Athenian", "Alexandrian", "Parisian", "New Yorker" |
| **exonym** | External name used by outsiders | "Bombay" (for Mumbai), "Peking" (for Beijing) |
| **endonym** | Internal name used by inhabitants | "Mumbai", "Beijing" 北京, "Zhōngguó" 中国 (for China) |
| **primary** | Principal or most commonly used name | Context-dependent |
| **variant** | Alternative spelling or form | Historical variants, transliterations, abbreviations |
| **historical** | Name used in the past but no longer current | "Constantinople" (for Istanbul), "Byzantium" |
| **colloquial** | Informal or popular name | "The Big Apple" (NYC), "The Eternal City" (Rome) |

**Notes:**
- A single Name can have multiple types. For example, "Hellas" (Ἑλλάς) can be `["toponym", "ethnonym"]`
- **Toponym** is the inclusive category for all geographic feature names
- Specific feature types (rivers, mountains, seas) are indicated through Subject classification (`has_type`) rather than as separate name types
- No combinations are forbidden; the model accommodates complex naming practices across cultures
- This vocabulary is extensible; new name_types can be added as needed

---

## 3. Source Type Vocabulary

The `source_type` array indicates the nature of evidence sources. Values align with Dublin Core type vocabulary where applicable:

| Source Type | Dublin Core Alignment | Definition | Examples |
|-------------|----------------------|------------|----------|
| `inscription` | dcterms:Text | Carved or inscribed text | Stone inscriptions, coins, monuments |
| `manuscript` | dcterms:Text | Handwritten documents | Medieval codices, scrolls, travel accounts |
| `map` | dcterms:Image | Cartographic documents | Historical maps, atlases, nautical charts |
| `archaeological` | dcterms:PhysicalObject | Archaeological evidence | Excavation reports, site surveys, stratigraphy |
| `dataset` | dcterms:Dataset | Structured data collections | Gazetteers, databases, compiled datasets |
| `oral_tradition` | dcterms:Sound (extended) | Oral historical accounts | Recorded interviews, transmitted stories |
| `administrative` | dcterms:Text | Official administrative records | Census data, tax rolls, land registers |
| `published` | dcterms:Text | Published scholarly works | Academic articles, books, monographs |
| `crowdsourced` | dcterms:Collection | Community-contributed data | Wikipedia, OpenStreetMap, collaborative projects |

**Notes:**
- Multiple source types can apply to a single attestation (hence array)
- Align with Dublin Core terms where possible for interoperability
- Vocabulary is extensible for domain-specific source types

---

## 4. Temporal Precision Vocabulary

The `precision` field in Timespan entities uses controlled vocabulary:

| Precision Value | Definition | Example Use Case |
|-----------------|------------|------------------|
| `exact` | Specific date known with certainty | Battle date, treaty signing, known construction date |
| `circa` | Approximate date within specified range | "circa 750 CE ±50 years" |
| `decade` | Precision to within a decade | "1270s", "780s BCE" |
| `century` | Precision to within a century | "3rd century CE", "12th century" |
| `millennium` | Precision to within a millennium | "2nd millennium BCE" |
| `era` | Broad historical period | "Classical Antiquity", "Medieval Period" |
| `year` | Precision to the year (but not exact date within year) | "1066" without knowing the specific day |

**Notes:**
- Use `precision_value` field for numeric uncertainty (e.g., `precision: "circa"`, `precision_value: 50` = ±50 years)
- For geological time, use `era` with appropriate `precision_value` in years

---

## 5. Spatial Precision Vocabulary

The `precision` array in Geometry entities can include qualitative assessments:

| Precision Value | Definition | Usage |
|-----------------|------------|-------|
| `exact` | Surveyed or precisely measured coordinates | GPS coordinates, modern surveys, verified monuments |
| `approximate` | Estimated location within reasonable bounds | Historical descriptions, general references |
| `representative` | Point represents area/region, not exact spot | Centroid of region, approximate settlement center |
| `centroid` | Mathematical center of polygon | Calculated geometric center |
| `derived` | Computed from other geometries | Inherited geometry, calculated unions |
| `uncertain` | Low confidence in location | Contested sites, poorly documented places |

**Notes:**
- Multiple precision descriptors can apply (e.g., `["approximate", "centroid"]`)
- Use `precision_km` array for quantitative uncertainty from multiple analyses
- Spatial precision distinct from temporal precision

---

## 6. Connection Type Vocabulary (for Networks)

The `connection_type` field in `connection_metadata` uses domain-specific vocabulary:

| Connection Type | Definition | Example Applications |
|-----------------|------------|----------------------|
| `trade` | Commercial exchange relationships | Merchant routes, port connections, market networks |
| `diplomatic` | Political/diplomatic relationships | Treaty networks, embassy connections, alliance systems |
| `postal` | Communication via postal systems | Mail routes, courier networks, postal stations |
| `telecommunication` | Electronic communication networks | Telegraph lines, telephone networks, early internet |
| `administrative` | Governance and administration links | Imperial administration, colonial governance, tax collection |
| `military` | Military connections and supply lines | Garrison networks, supply routes, strategic positions |
| `social` | Social and cultural connections | Family networks, scholarly exchanges, religious communities |
| `religious` | Religious pilgrimage or institutional ties | Pilgrimage routes, monastery networks, ecclesiastical hierarchy |
| `scholarly` | Academic and intellectual exchange | University networks, correspondence networks, translation centers |
| `maritime` | Sea-based connections | Shipping routes, naval networks, fishing fleets |
| `riverine` | River-based connections | River trade, canal systems, riverine communication |

**Notes:**
- Connection types are extensible for specific research domains
- Multiple connection types can characterize a single link (e.g., both trade and diplomatic)
- Use `connection_metadata` for additional domain-specific attributes

---

## 7. Directionality Vocabulary (for Networks)

The `directionality` field in `connection_metadata`:

| Directionality | Definition | Example |
|----------------|------------|---------|
| `bidirectional` | Flow in both directions equally | Mutual trade relationships, two-way postal routes |
| `from_subject_to_object` | Flow from subject to object only | Tribute payments, one-way supply lines |
| `from_object_to_subject` | Flow from object to subject only | Reverse of above |
| `asymmetric` | Bidirectional but unequal flows | Unequal trade balances, hierarchical relationships |

---

## 8. Certainty Assessment

The `certainty` field (0.0–1.0 float) and optional `certainty_note` provide evidence quality assessment:

**Recommended Scale:**
- `1.0`: Definitively proven by multiple independent sources
- `0.9–0.99`: Very high confidence, strong evidence
- `0.7–0.89`: High confidence, good evidence
- `0.5–0.69`: Moderate confidence, reasonable evidence
- `0.3–0.49`: Low confidence, weak or contested evidence
- `0.1–0.29`: Very low confidence, speculative
- `0.0`: No confidence, hypothetical only

**Notes:**
- Certainty is inherently subjective; use `certainty_note` to explain assessment
- Float scale provides more granularity than CIDOC-CRM's qualitative types
- Consider source reliability, corroboration, and potential bias in assessment