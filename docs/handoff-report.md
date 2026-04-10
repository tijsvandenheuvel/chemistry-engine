# Handoff Report

## Doel van dit document

Dit document bundelt alles wat in deze conversatie is besproken over wat de Chemie Engine moet kunnen, welke productrichting is gekozen, wat al gebouwd is, welke bron- en kwaliteitsvereisten gelden, en welke vervolgstappen nog nodig zijn.

Dit document is bedoeld als overdrachtsdocument voor een volgende engineer, agent of product owner.

Deze versie vervangt oudere handoff-notities en is afgestemd op de huidige repo-status per `2026-04-10`.

## Productvisie

De Chemie Engine moet evolueren naar een samenhangend chemistry platform waarin gebruikers:

- atomen kunnen bekijken
- moleculen kunnen bekijken
- reacties kunnen bekijken
- productieroutes en proceschemie kunnen bekijken
- spectra kunnen bekijken
- van een chemistry item naar gerelateerde items kunnen browsen
- betrouwbare chemische informatie uit open en bronvaste databronnen kunnen raadplegen
- moleculen visueel in 3D kunnen renderen
- reacties als geanimeerde visuele transities kunnen volgen

Het systeem moet dus niet alleen een molecule viewer zijn, maar een chemistry graph met browsing, rendering, spectra, reactions en bronverwijzingen.

## Oorspronkelijke scope uit de conversatie

De oorspronkelijke vraag bestond uit deze productdoelen:

- een chemie-engine bouwen
- 3D molecule rendering ondersteunen
- animated reaction views ondersteunen
- op basis van schets, schema en spectrum een 3D rendering van een molecule kunnen genereren
- een databank van moleculen opbouwen
- APIs gebruiken om informatie en spectra van moleculen van het internet te verzamelen
- een molecule viewer en molecule browser maken
- molecules, reacties en productieprocessen in een viewer tonen
- SciFinder onderzoeken en open source alternatieven in kaart brengen
- een eigen systeem bouwen met de beste open kennis en tools
- als MVP: basis-molecules waarvan de structuur gekend is kunnen renderen in een mooie interface met overzicht van alle molecules

## UX-richting die besproken en gedeeltelijk gebouwd is

De interface moet:

- een mooie, intentionele lab-achtige UI hebben
- een centrale browserkolom hebben
- niet te lang worden door te veel lijstitems
- scrollbare lijsten binnen panelen gebruiken
- molecules, atoms en reactions naast elkaar als browse-entiteiten ondersteunen
- categorieen per itemtype tonen
- collapsible filterzones hebben
- snelle cross-navigation toelaten:
  - molecule -> reaction
  - reaction -> molecule
  - atom -> molecule
  - atom -> reaction
  - reaction -> atom
- een compacte, bruikbare header hebben met snelle navigatie
- een Mendeleev / periodic-table view hebben om door alle elementen te navigeren

## Huidige implementatiestatus

### Reeds gebouwd

Er staat vandaag een werkende React/Vite/TypeScript app in de repo met:

- een molecule browser
- een 3D molecule viewer op basis van `3Dmol.js`
- een molecule-rotatie toggle zodat de 3D scene kan stoppen met draaien
- een spectral panel onder de 3D viewer
- collapsible dossier-secties voor molecules, atoms en reactions
- gecombineerde en standaard gesloten source/reference-secties
- een compacte header met workspace- en Mendeleev-navigatie
- een Mendeleev / periodic-table view
- een atom viewer modal die opent vanuit de periodic table
- een PubChem-backed molecule catalogus
- een grotere lokaal gegenereerde molecule-dataset
- een atoms-browser over alle `118` elementen
- een reactions-browser
- cross-navigation tussen molecules, atoms en reactions
- scrollbare browserlijsten
- collapsible categorieblokken voor molecules, atoms en reactions
- animated reaction storyboards
- een reaction flow panel met eerlijke labeling als modeled transition
- een multi-molecule 3D reaction theatre waarin reactants en products samenkomen of opsplitsen
- een seed-dataset van `100` eenvoudige reactions

### Huidige data-omvang

De app bevat momenteel:

- `231` molecules uit PubChem
- `118` atoms in de atom store en Mendeleev view
- `100` eenvoudige reactions in de huidige seed-set
- `895` spectral profiles, momenteel vooral structure-derived previews

### Huidige reaction-dekking in de app

De reaction viewer bevat nu een bredere seed over meerdere families, onder andere:

- combustions
- hydrations en dehydrations
- esterifications en hydrolyses
- oxidations
- neutralizations
- gas-evolution en capture routes
- enkele pharma- en process-side voorbeelden zoals:
  - Aspirin Synthesis
  - Ethyl Acetate Esterification
  - Ethanol Combustion
  - Urea Synthesis
  - Nitrogen Dioxide Absorption

Belangrijke nuance:

- deze `100` reactions zijn browsebaar en geanimeerd
- de reaction facts zijn nog niet volledig provenance-first uitgewerkt
- de 3D transitions zijn modeled visualisaties, geen exacte atom-mapped mechanistische waarheid

## Wat het systeem uiteindelijk moet kunnen

## 1. Molecules

Het systeem moet molecules kunnen:

- browsen
- zoeken
- filteren op categorie
- in 3D renderen
- tonen met structurele metadata
- linken aan spectra
- linken aan reactions
- linken aan externe databronnen
- linken aan gerelateerde atoms
- linken aan papers, patents en provenance records

Per molecule moet uiteindelijk bronvaste data getoond kunnen worden zoals:

- naam
- IUPAC-naam
- formule
- SMILES
- CID of andere primaire identifier
- moleculaire massa
- exact mass
- TPSA
- XLogP
- H-bond donor/acceptor count
- complexiteit
- charge
- bron
- spectra
- use cases
- hazard notes
- externe links

## 2. Atoms

Het systeem moet atoms kunnen:

- browsen
- filteren per familie
- tonen met periodieke en chemische metadata
- linken aan molecules waarin ze voorkomen
- linken aan reactions waarin molecules met die atomen voorkomen
- in latere fases in verschillende atom rendering modes tonen

De huidige atom dataset ondersteunt al de volledige periodic table, dus `118` elementen.

Voor elk atoom is gewenst:

- naam
- symbool
- atoomnummer
- atoommassa
- categorie
- standaardfase
- groep
- periode
- elektronconfiguratie
- oxidatietoestanden
- isotopeninformatie waar beschikbaar
- koppeling naar bron

Belangrijke nuance bij de huidige implementatie:

- niet elk element heeft al dezelfde curatorische diepte
- een deel van de records is nu periodic-table coverage
- rijkere brondata, isotopeninformatie en provenance moeten later verder worden verrijkt

## 3. Reactions

Het systeem moet reactions kunnen:

- browsen
- zoeken
- filteren op reaction category
- tonen als reaction equation
- tonen met reactants, products en catalysts
- tonen met solvent, temperature en notes
- linken aan molecules
- linken aan atoms die in die reaction-context voorkomen
- in een aparte reaction explorer worden bekeken
- geanimeerd worden afgespeeld

Reactiondata moet in latere fases ook omvatten:

- stoichiometrie
- reaction conditions
- yields
- reagents
- catalysts
- intermediates waar beschikbaar
- literature/paper links
- patent links
- bron- en evidence-informatie

## 4. Spectra

Het systeem moet spectra kunnen:

- tonen onder de 3D renderer
- per molecule meerdere spectrumtypes tonen
- bron en meettype expliciet tonen
- measured versus predicted duidelijk scheiden
- spectra koppelen aan bronrecords

Spectrumtypes die besproken zijn:

- `1H NMR`
- `13C NMR`
- `IR`
- `MS`
- `MS/MS`
- `UV/Vis`

Belangrijke productregel:

- voorspelde spectra mogen niet als experimentele waarheid voorgesteld worden
- gemeten spectra en predicted spectra moeten expliciet verschillend gelabeld zijn

## 5. Animated reactions

Een centrale wens is om reactions niet alleen tekstueel maar ook visueel te tonen.

Het systeem moet daarom evolueren naar:

- een aparte, mooi geintegreerde reaction pass
- 3D reaction playback
- een geanimeerde loop per reaction
- visuele weergave van hoe atomen samenkomen of splitsen

Belangrijke nuance uit de architectuurplanning:

- exacte brondata en gemodelleerde visualisaties zijn niet hetzelfde
- een reaction animation is alleen exact op atomniveau als er betrouwbare atom mapping bestaat
- zonder atom mapping moet de animation expliciet gelabeld worden als `modelled structural transition`

Dus:

- source-backed reaction facts mogen als exact gepresenteerd worden
- atom-joining en bond-breaking animations moeten provenance-aware en eerlijk gelabeld worden

De huidige status hiervan is:

- er is nu een echte multi-molecule 3D reaction stage
- reactants en products bewegen visueel naar een reaction core of eruit weg
- er is een atom-flux overlay op basis van formules
- dit blijft expliciet een modeled 3D transition zolang betrouwbare atom mapping ontbreekt

## 6. Input vanuit schets, schema en spectrum

De oorspronkelijke productwens bevat ook:

- van schets of schema naar molecule gaan
- van spectrum naar molecule-identificatie of rendering gaan
- op basis van schets/schema/spectrum een 3D rendering genereren

Dit is nog niet gebouwd.

Waarschijnlijke toekomstige aanpak:

- schets/schemas:
  - OPSIN
  - Open Babel
  - RDKit
  - structure parsing / normalization
- spectrum-to-structure:
  - veel moeilijker
  - eerder workflow met candidate retrieval dan direct one-shot reconstruction

Voor de handoff is belangrijk:

- dit hoort in de toekomstige ingest- en identification pipeline
- dit valt duidelijk buiten de huidige MVP

## 7. Productieprocessen en proceschemie

De wens was ook om niet alleen losse reactions maar bredere productieprocessen te kunnen bekijken.

Daarvoor moet het systeem uiteindelijk:

- process-side reaction chains kunnen tonen
- feedstocks, intermediates en products kunnen tonen
- meerdere linked reactions in een route of process flow kunnen weergeven
- navigatie tussen reaction steps en molecules ondersteunen

Dit is nog niet uitgewerkt als aparte proceslaag, maar process-side reactions zitten wel al in de dataset en viewer.

## Databronstrategie die besproken is

## SciFinder

SciFinder is onderzocht als referentieproduct.

Conclusie:

- SciFinder is sterk in substances, reactions, patents en literature discovery
- SciFinder is commercieel en duur
- het is geen geschikte basis voor een open MVP of open data backbone

## Open en relevante alternatieven

De beoogde open stack die besproken is:

- PubChem
- ChEMBL
- ChEBI
- OPSIN
- RDKit
- Open Babel
- Open Reaction Database
- Rhea
- SureChEMBL
- OpenAlex
- Europe PMC
- HMDB
- nmrshiftdb2
- GNPS
- MassBank

## Bronnen per domein

### Molecules

Primair:

- PubChem PUG REST
- PubChem PUG View

Secundair:

- ChEMBL
- ChEBI

### Reactions

Primair gewenste next step:

- Rhea

Secundair of aanvullend:

- Open Reaction Database

### Atoms

Primair gewenste next step:

- NIST Atomic Weights and Isotopic Compositions
- CIAAW standard atomic weights
- NIST Atomic Spectra Database

### Spectra

Gewenste open bronnen:

- PubChem spectral/annotation records
- HMDB
- nmrshiftdb2
- MassBank
- GNPS

## Betrouwbaarheid en exactheid

Een expliciete eis uit de conversatie was:

- alle informatie in de app moet uit betrouwbare bronnen komen
- alles wat als chemische data wordt voorgesteld moet exact zijn
- minstens honderd datapoints per type moeten voorzien worden

De architecturale interpretatie hiervan is:

- `100+ records per type`, niet `100 velden per individueel item`

Doelwaarden:

- atoms: `118`
- molecules: `100+`, liefst `500+`
- reactions: `100+`

Belangrijke kwaliteitsregel:

- elk getoond gegeven moet provenance krijgen

Per datapunt moet idealiter vastgelegd worden:

- bron
- bron-id
- URL
- evidence type
- licentie of access mode
- datum van ingest of verificatie

Evidence types die besproken zijn:

- `measured`
- `curated`
- `source-computed`
- `app-modelled`

## Verification-laag

De repo bevat nu ook een expliciete verification-laag die per entity een bronvergelijking en disagreement-weergave kan tonen.

Huidige status per domein:

- molecules:
  - vergelijking tussen lokale catalog-snapshot en live PubChem property-feed
  - checks op onder andere formule, IUPAC, molecular weight, exact mass, XLogP, TPSA, H-bond counts, charge en complexity
  - velden zonder externe counterpart worden expliciet als `single-source` gelabeld
- atoms:
  - vergelijking tussen `periodic-table` baseline en `curated atom seed` waar die bestaat
  - conflicten in atomic weight, category, phase en period/group worden zichtbaar gemaakt
  - elektronconfiguratie en oxidatietoestanden blijven voorlopig meestal `single-source`
- reactions:
  - interne consistency check op basis van atom-balance uit molecuulformules
  - participant source-coverage wordt zichtbaar gemaakt
  - exact externe record-match naar Rhea / ORD staat nog als `pending`
  - playback exactness blijft eerlijk gelabeld als `modelled` zolang er geen atom mapping is

Verification-statussen die nu al in de UI bestaan:

- `verified`
- `conflict`
- `single-source`
- `pending`
- `modelled`

Belangrijke nuance:

- `verified` betekent alleen dat de momenteel gekoppelde bronnen voor dat specifieke veld overeenkomen
- `conflict` betekent niet automatisch dat een bron fout is; het kan ook gaan om rounding, brondefinitieverschillen, concentratie/contextverschillen of catalog-drift
- `single-source` betekent zichtbaar dat er nog geen echte cross-source check is gebeurd
- `modelled` hoort bij visualisaties of interpretatieve lagen en niet bij exacte chemische waarheid

## Grote architectuurrichting

De app moet doorgroeien van een molecule-first MVP naar een chemistry graph:

- `Atoms <-> Molecules <-> Reactions <-> Spectra <-> Sources`

Dat betekent concreet:

- provenance als eerste-klasse model
- datasets niet alleen als platte arrays maar als linked graph
- browse-ervaring rond relaties, niet alleen rond individuele records

## Belangrijke datamodeluitbreidingen die besproken zijn

Minimaal gewenst:

- `AtomRecord`
- `IsotopeRecord`
- `SpectrumRecord`
- `ProvenanceRecord`
- `ReactionParticipant`
- `ReactionCondition`
- `EvidenceRecord`

Huidige situatie:

- `AtomRecord` is aanwezig en uitgebreid naar volledige periodic-table coverage
- reactions hebben categorieen, steps en modeled playback-annotatie
- provenance is nog geen first-class field-level model
- reaction participants en conditions zijn nog geen volledig losgekoppelde provenance-first modellen

## Belangrijke technische keuzes die al genomen zijn

- Frontend stack:
  - React
  - TypeScript
  - Vite
- 3D rendering:
  - `3Dmol.js`
- UI animation:
  - `framer-motion`
- catalogusgeneratie:
  - lokaal via script
- PubChem wordt gebruikt als primaire molecule-bron
- grote moleculecatalogus wordt statisch gegenereerd voor snelle browsing zonder runtime rate limiting

## Scripts en dataflows die al bestaan

Er zijn al scripts aanwezig voor:

- PubChem sync van seed molecules
- PubChem catalog generation voor een grotere moleculecatalogus

Belangrijke commands:

```bash
npm install
npm run dev
npm run build
npm run sync:pubchem
npm run build:catalog
```

## Huidige beperkingen en open gaps

De belangrijkste actuele beperkingen zijn:

- spectra zijn nog grotendeels predicted previews en niet breed measured-ingested
- reaction facts zijn nog niet volledig provenance-first of bronvast op veldniveau
- reaction animations zijn nog niet exact atom-mapped
- atom records buiten de curated kern zijn nog niet even rijk verrijkt
- literature-, patent- en paper-graphlaag ontbreekt nog
- sketch/schema/spectrum-to-structure pipeline is nog niet gebouwd
- bundle blijft groot door `3Dmol.js` en de lokale catalogus
- er is nog geen aparte process-route explorer bovenop losse reactions

## Aanbevolen vervolgstappen

De meest logische volgende fasen zijn:

1. provenance-model en exactheidslabels invoeren op veldniveau
2. reaction dataset verschuiven van seed-only naar bronvaste Rhea / ORD ingest
3. measured spectra pipeline toevoegen
4. atom records verrijken met bron- en isotopendata
5. reaction explorer uitbreiden met echte routes, conditions en stoichiometrie
6. atom-mapped animations alleen inschakelen waar de data dit toelaat
7. later meerdere atom visual models en procesflows toevoegen

## Samenvatting

De Chemie Engine is vandaag geen molecule-only MVP meer, maar een bredere chemistry workspace met:

- `231` molecules
- `118` atoms
- `100` reactions
- `895` spectra
- 3D molecule rendering
- atom viewing via periodic table en modal
- reaction browsing en multi-molecule 3D playback

De afgesproken eindrichting blijft een bronvaste chemistry graph met exacte data, provenance, measured spectra, rijke reactiondekking, volledige atom coverage en een eerlijke scheiding tussen source-backed chemische feiten en gemodelleerde animaties.
