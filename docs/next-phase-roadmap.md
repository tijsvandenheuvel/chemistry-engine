# Next Phase Roadmap

## Focus

De eerstvolgende fase na de huidige molecule-first MVP is geen generieke polishronde, maar een gerichte uitbreiding van de chemistry graph rond:

- visualisaties van atoommodellen
- rijkere visualisaties van chemische reacties
- een curated databank van ongeveer `50` algemene chemische reacties

Deze fase moet de app inhoudelijk sterker maken zonder de waarheidsregel te breken: exact bronmateriaal en gemodelleerde visualisaties moeten apart gelabeld blijven.

## Deliverables

### 1. Atoomvisualisaties

- Voeg atoomspecifieke render modes toe naast de huidige molecule-viewer context.
- Start met een bruikbare basisset:
  - nucleus + electron shell model
  - eenvoudige ball representation
  - periodieke metadata view
- Beperk exacte claims tot bronvaste atoomgegevens zoals:
  - atoomnummer
  - atoommassa
  - groep en periode
  - oxidatietoestanden
- Visuele interpretaties zoals shells of modelweergaven moeten expliciet als model worden behandeld.

### 2. Reaction visualisaties

- Bouw een duidelijkere reaction explorer of reaction pass boven op de bestaande storyboard/timeline.
- Toon naast equation en voorwaarden ook:
  - reactants
  - products
  - catalysts
  - solvent
  - temperatuur
- Voor animaties gelden twee modes:
  - exact, alleen wanneer betrouwbare atom mapping beschikbaar is
  - `modelled structural transition`, wanneer de transitie visueel wordt benaderd zonder bronvaste mapping

### 3. Curated reaction databank

- Breid `src/data/reactions.seed.json` uit van `3` naar ongeveer `50` algemene reactions.
- Dek minstens deze groepen af:
  - verbrandingsreacties
  - zuur-base reacties
  - neutralisaties
  - precipitatie
  - redox
  - substitutie
  - additie
  - eliminatie
  - esterificatie
  - hydrolyse
  - polymerisatie
  - eenvoudige industriele processtappen
- Bewaar per reaction minimaal:
  - naam
  - categorie
  - equation
  - reactants
  - products
  - optionele catalyst
  - solvent
  - temperature
  - notities over modelled versus exact visualisatie

## Datamodel uitbreiding

De huidige types zijn voldoende voor de MVP, maar de volgende fase heeft best nieuwe records of veldlagen voor:

- `ReactionParticipant`
- `ReactionCondition`
- `ProvenanceRecord`
- `EvidenceRecord`
- optionele atom-visualization metadata
- optionele reaction-animation metadata, inclusief mapping confidence

## Aanbevolen bronstrategie

- Molecules: `PubChem PUG REST` en `PUG View`
- Reactions: eerst `Rhea`, later `Open Reaction Database`
- Atoms: `NIST`, `CIAAW`, `NIST Atomic Spectra Database`
- Spectra: `PubChem`, `HMDB`, `nmrshiftdb2`, `MassBank`, `GNPS`

Voor de eerste `50` reactions is een curated seed-set aanvaardbaar, zolang de herkomst per reaction later terug te koppelen is naar een echte bron.

## Acceptatiecriteria

- De docs leggen expliciet uit wat exact bronmateriaal is en wat gemodelleerd is.
- De UI kan atoms, molecules en reactions coherenter doorverbinden.
- De reaction dataset bevat ongeveer `50` bruikbare, algemene reactions.
- Nieuwe visualisaties schaden de huidige browseflow niet.
- Exacte reaction- of spectrumclaims worden nergens zonder bronlabel gepresenteerd.

## Niet in deze fase

- sketch-to-structure
- spectrum-to-structure identificatie
- volledige proceschemie met meerstaps routes
- literatuur- en patentgraph als first-class UI-laag
- volledige measured spectra ingest pipeline
