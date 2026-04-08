# Handoff Report

## 1. Productdoel

De Chemie Engine moet doorgroeien van een molecule-first MVP naar een volledig chemistry platform waarin gebruikers atomen, moleculen, reacties, spectra, productieprocessen en hun onderlinge relaties kunnen bekijken, browsen en visueel begrijpen.

## 2. Oorspronkelijke scope

- Bouw een chemie-engine.
- Ondersteun 3D molecule rendering.
- Ondersteun animated reaction views.
- Genereer op basis van schets, schema en spectrum een 3D rendering van een molecule.
- Bouw een databank van moleculen.
- Gebruik APIs om moleculedata en spectra van het internet te verzamelen.
- Bouw een molecule viewer en molecule browser.
- Toon molecules, reactions en productieprocessen in een viewer.
- Onderzoek SciFinder en open source alternatieven.
- Bouw een eigen open systeem met de beste beschikbare kennis en tools.
- MVP: basis-molecules met gekende structuur renderen in een mooie interface met overzicht van alle molecules.

## 3. Huidige status van de app

- React/Vite/TypeScript frontend staat.
- 3D molecule viewer via `3Dmol.js` staat.
- Molecule browser staat.
- Spectral panel onder de 3D viewer staat.
- Animated reaction storyboard staat.
- Reaction 3D sidecar/loop staat.
- PubChem-backed molecule catalogus staat.
- Atoms-browser staat voor de elementen die momenteel in de catalogus voorkomen.
- Reactions-browser staat.
- Cross-navigation tussen molecules, atoms en reactions staat.
- Browserlijst is scrollbaar gemaakt.
- Categorieblokken zijn collapsebaar gemaakt.

## 4. Huidige data-omvang

- `231` molecules uit PubChem.
- `13` atoms die effectief in de huidige moleculecatalogus voorkomen.
- `3` reactions in de huidige seed-data.
- `895` spectral profiles, momenteel vooral structure-derived previews.

## 5. Reactions die nu al in de app zitten

- Aspirin Synthesis.
- Ethyl Acetate Esterification.
- Ethanol Combustion.

## 6. Wat het systeem uiteindelijk moet kunnen voor molecules

- Browsen.
- Zoeken.
- Filteren op categorie.
- In 3D renderen.
- Chemische metadata tonen.
- Spectra tonen.
- Externe bronlinks tonen.
- Reactions tonen waarin het molecule voorkomt.
- Gerelateerde atoms tonen.
- Later ook papers, patents en provenance tonen.

## 7. Wat het systeem uiteindelijk moet kunnen voor atoms

- Browsen.
- Filteren per family.
- Periodieke metadata tonen.
- Linken naar molecules waarin het atom voorkomt.
- Linken naar reactions waarin molecules met dat atom voorkomen.
- Later verschillende atom render modes ondersteunen.
- Uiteindelijk de volledige periodic table ondersteunen: `118` elementen.

## 8. Wat het systeem uiteindelijk moet kunnen voor reactions

- Browsen.
- Zoeken.
- Filteren op reaction category.
- Equation tonen.
- Reactants, products, catalysts, solvent, temperature tonen.
- Linken naar molecules.
- Linken naar betrokken atoms.
- In een aparte reaction explorer bekeken worden.
- Geanimeerd afgespeeld worden.
- Later ook stoichiometrie, yields, conditions, literature en patent links tonen.

## 9. Spectra-vereisten

- Spectra moeten onder de 3D renderer getoond kunnen worden.
- Per molecule meerdere spectrumtypes tonen.
- Duidelijk onderscheid tussen `measured` en `predicted`.
- Bronnen en recordlinks tonen.
- Relevante spectrumtypes: `1H NMR`, `13C NMR`, `IR`, `MS`, `MS/MS`, `UV/Vis`.

## 10. Kritieke waarheidsregel

- Alles wat als exacte chemische data wordt voorgesteld moet bronvast en betrouwbaar zijn.
- Predicted spectra mogen niet als experimentele waarheid voorgesteld worden.
- Exacte reaction facts en gemodelleerde visualisaties moeten expliciet onderscheiden worden.

## 11. Animated reactions

- Er moet een aparte, mooie geintegreerde reaction pass komen.
- Reactions moeten in 3D kunnen loopen.
- Atomen die samenkomen of splitsen moeten visueel getoond kunnen worden.
- Dat mag alleen als exact worden gepresenteerd wanneer er betrouwbare atom mapping bestaat.
- Zonder betrouwbare mapping moet het gelabeld worden als `modelled structural transition`.

## 12. Input vanuit schets, schema en spectrum

- Dit is gevraagd maar nog niet gebouwd.
- Toekomstige richting: structure parsing via tools zoals RDKit / Open Babel / OPSIN.
- Spectrum-to-structure is een latere, moeilijkere identificatielaag en hoort niet meer bij de huidige MVP.

## 13. Productieprocessen

- Niet alleen losse reactions, maar ook proceschemie en reaction chains moeten later bekeken kunnen worden.
- Feedstocks, intermediates en products moeten in routes browsebaar worden.
- De huidige combustion reaction is een eerste process-side voorbeeld, geen volledige procesmodule.

## 14. SciFinder en alternatieven

- SciFinder is onderzocht als referentieproduct.
- Conclusie: sterk, maar commercieel en duur.
- Niet geschikt als backbone voor een open MVP.
- Open stack die is besproken: PubChem, ChEMBL, ChEBI, RDKit, Open Babel, OPSIN, Open Reaction Database, Rhea, SureChEMBL, OpenAlex, Europe PMC, HMDB, nmrshiftdb2, GNPS, MassBank.

## 15. Gewenste bronstrategie

- Molecules: primair PubChem PUG REST + PUG View.
- Reactions: eerst Rhea, later aanvullend Open Reaction Database.
- Atoms: NIST + CIAAW + NIST Atomic Spectra Database.
- Spectra: PubChem records, HMDB, nmrshiftdb2, MassBank, GNPS.

## 16. Datakwaliteit en schaal

- Minstens `100+` records per type.
- Atoms: doel `118`.
- Molecules: doel `100+`, liefst `500+`.
- Reactions: doel `100+`.
- Elk datapunt moet uiteindelijk provenance hebben: bron, bron-id, URL, evidence type, access/licentie, ingest/verificatiedatum.

## 17. Evidence-typen die afgesproken zijn

- `measured`
- `curated`
- `source-computed`
- `app-modelled`

## 18. Gewenste architectuur

De app moet een chemistry graph worden:

`Atoms <-> Molecules <-> Reactions <-> Spectra <-> Sources`

## 19. Gewenste datamodeluitbreidingen

- `AtomRecord`
- `IsotopeRecord`
- `SpectrumRecord`
- `ProvenanceRecord`
- `ReactionParticipant`
- `ReactionCondition`
- `EvidenceRecord`

## 20. UX-vereisten uit de conversatie

- Mooie, intentionele lab-achtige interface.
- Sidebar/browser mag niet te lang worden.
- Item cards moeten binnen hun container blijven.
- Browserlijst moet intern scrollen.
- Categorieen moeten per type gegroepeerd zijn.
- Categorieblokken moeten collapsebaar zijn.
- Navigatie tussen molecules, atoms en reactions moet snel en logisch zijn.

## 21. Technische keuzes die al vastliggen

- Frontend: React + TypeScript + Vite.
- 3D rendering: `3Dmol.js`.
- UI animation: `framer-motion`.
- PubChem als primaire moleculebron.
- Grote moleculecatalogus voorlopig statisch gegenereerd voor snelle lokale browseflows.

## 22. Huidige beperkingen

- Slechts `3` reactions.
- Atoms nog niet de volledige periodic table.
- Spectra nog niet overal measured records.
- Nog geen echte atom-mapped reaction animation.
- Provenance nog niet als first-class field-level model.
- Nog geen literature/patent graphlaag.
- Sketch/schema/spectrum-to-structure nog niet gebouwd.
- Bundle is groot door `3Dmol.js` en lokale catalogus.

## 23. Reeds besproken vervolgfases

1. Provenance-model en exactheidslabels invoeren.
2. Atom dataset uitbreiden naar `118` elementen.
3. Curated reactions uitbreiden naar `100+`.
4. Echte measured spectra pipeline toevoegen.
5. Aparte reaction explorer bouwen.
6. Atom-mapped animations alleen waar data het toelaat.
7. Later meerdere atom visual models toevoegen.

## 24. Operationele notities

- Starten: `npm install`, `npm run dev`.
- Build: `npm run build`.
- PubChem sync: `npm run sync:pubchem`.
- Grote catalogus bouwen: `npm run build:catalog`.

## 25. Git/GitHub context

- Gewenste repo: `tijsworld/chemistry-engine`.
- Lokale git-initialisatie is gebeurd.
- Commit en remote setup konden in deze sessie niet volledig worden afgewerkt door runtimebeperkingen op `.git/` en ontbrekende GitHub-auth/CLI.

## 26. Samenvatting

De Chemie Engine is nu een sterke molecule-first MVP met 3D viewer, spectra-preview, atoms-browser en basis reactions. De afgesproken eindrichting is een bronvaste chemistry graph met exacte data, provenance, measured spectra, `100+` reactions, volledige atom coverage en eerlijke scheiding tussen source-backed chemische feiten en gemodelleerde animaties.
