# Research Notes

## SciFinder

CAS SciFinder is sterk in structure search, reaction search, patent- en literatuurkoppeling, maar is commercieel en doorgaans te duur voor een lichtgewicht MVP of open platform.

## Praktische open stack

Voor een eigen systeem is een combinatie van bronnen verstandiger dan proberen SciFinder exact te vervangen:

- `PubChem` voor compound-identiteit, properties, synonyms, 2D/3D records en bulk data.
- `ChEMBL` voor bioactivity en curated medicinal chemistry context.
- `ChEBI` voor stabiele identifiers en ontology.
- `SureChEMBL` voor open patent chemistry.
- `OpenAlex` en `Europe PMC` voor paper discovery.
- `MassBank`, `GNPS`, `HMDB` en `nmrshiftdb2` voor open spectra.
- `RDKit`, `Open Babel` en `OPSIN` voor parsing, normalization, standardization en structure generation.

## Aanbevolen architectuur

1. Centrale compound store met eigen IDs plus cross references naar PubChem CID, ChEMBL ID, ChEBI ID en InChIKey.
2. Structure service voor SMILES, InChI, MOL/SDF, fingerprints en conformer references.
3. Literature service voor papers, patents en provenance.
4. Spectra service voor NMR, IR, MS/MS en UV/Vis records.
5. Reaction graph met reactants, products, conditions, catalysts, yields en source papers.
6. Frontend met molecule browser, 3D viewer, reaction playback en source panels.

## Wat deze repo nu doet

Deze MVP zet stap 1 en 6 neer:

- seed molecule database
- reaction catalog
- PubChem enrichment script
- browser + detailpaneel + 3D rendering

De volgende stap is een echte ingest worker die open spectral databases en paper APIs periodiek sync't.

Op dit moment toont de frontend al spectrumkaarten, maar die zijn structure-derived previews en niet overal experimenteel gemeten pieken. Een volgende iteratie moet PubChem-linked spectral records, nmrshiftdb2, MassBank en HMDB gebruiken om echte peak lists per molecule in te laden waar beschikbaar.

## Bronlinks

- CAS SciFinder substance search: https://www.cas.org/solutions/cas-scifinder-discovery-platform/chemical-substances
- PubChem PUG REST tutorial: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial
- PubChem PUG View: https://pubchem.ncbi.nlm.nih.gov/docs/pug-view
- ChEMBL training and search overview: https://www.ebi.ac.uk/training/online/courses/chembl-quick-tour/accessing-chembl-data/searching-using-the-web-interface/
- OPSIN name-to-structure service: https://www.ebi.ac.uk/opsin/
- Open Reaction Database docs: https://docs.open-reaction-database.org/
- OpenAlex API docs: https://docs.openalex.org/
- nmrshiftdb2: https://nmrshiftdb.nmr.uni-koeln.de/
- GNPS portal: https://gnps.ucsd.edu/ProteoSAFe/static/gnps-splash-old.jsp
- HMDB documentation: https://www.hmdb.ca/sources
