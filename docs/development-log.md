# Development Log

## Doel

Dit document houdt het development proces van Chemie Engine bij:

- welke features zijn toegevoegd
- waarom bepaalde technische keuzes zijn gemaakt
- welke ingest-runs en verificaties zijn uitgevoerd
- welke open risico's en vervolgstappen nog bestaan

Dit logboek is bedoeld als repo-brede bron van waarheid naast chatgeschiedenis.

## Huidige status

Per `2026-04-08` bevat de MVP:

- een molecule browser met categorie-filters en search
- een PubChem-backed 3D viewer
- een spectral panel met structure-derived spectrum previews
- animated reaction storyboards
- een 3D reaction loop die meebeweegt met de actieve reaction step
- een gegenereerde PubChem catalogus met honderden molecules

## Timeline

### 2026-04-07

#### Workspace bootstrap

- De workspace was leeg; er was geen bestaande app of git-repo aanwezig.
- Gekozen stack:
  - `React`
  - `TypeScript`
  - `Vite`
  - `3Dmol.js` voor molecule rendering
  - `framer-motion` voor UI-animaties

#### Eerste MVP opzet

- Projectstructuur opgezet met frontend, seed-data en scripts.
- Eerste seed-catalogus toegevoegd met basiscompounds zoals:
  - water
  - ethanol
  - acetic acid
  - benzene
  - salicylic acid
  - aspirin
  - caffeine
- Eerste reaction dataset toegevoegd met onder andere:
  - aspirin synthesis
  - ethyl acetate esterification
  - ethanol combustion

#### Eerste data-integratie

- `scripts/sync-pubchem.mjs` gebouwd.
- Doel van dit script:
  - compound properties ophalen uit PubChem
  - beschrijvende metadata ophalen
  - synonym data ophalen
  - 3D SDF snapshots lokaal bewaren
- Snapshots worden weggeschreven naar:
  - `data/pubchem/`
  - `public/data/pubchem/`

#### Eerste frontend versie

- Browser, 3D viewer, detailpaneel en reaction timeline gebouwd.
- UI-richting:
  - donkere lab-interface
  - sterke typografie
  - kaarten met high-contrast panelen
  - focus op molecule selection en reaction storytelling

#### Verificatie

- `npm install`
- `npm run build`
- `npm run sync:pubchem`

#### Resultaat

- Eerste werkende MVP stond lokaal.
- PubChem sync leverde echte compound snapshots op.

### 2026-04-08

#### Catalogus opgeschaald

- Nieuwe catalog-builder toegevoegd in `scripts/build-pubchem-catalog.mjs`.
- Deze builder resolve't een brede lijst molecule-namen via PubChem PUG REST en genereert `src/data/molecules.catalog.json`.
- Families die expliciet in de builder zijn opgenomen:
  - solvents
  - aromatics
  - acids
  - heterocycles and reagents
  - monomers and feedstocks
  - sugars
  - amino acids
  - nucleobases and vitamins
  - pharma compounds
  - natural products
  - inorganic/process compounds
  - halogenated compounds

#### Catalogus output

- Eerste opgeschaalde run gaf `221` molecules.
- Na extra retry/backoff voor PubChem `ServerBusy` responses groeide dit naar `231` molecules.
- De catalogus bevat nu ook afgeleide metadata zoals:
  - `exactMass`
  - `complexity`
  - `charge`
  - `sourceDatabase`

#### Spectral diagrams toegevoegd

- Datamodel uitgebreid met:
  - `SpectrumProfile`
  - `SpectrumPeak`
  - meerdere spectra per molecule
- Nieuw component toegevoegd: `src/components/SpectralPanel.tsx`.
- Spectrumtypes die nu worden gegenereerd:
  - `IR`
  - `MS`
  - `UV/Vis`
  - `1H NMR` waar logisch

#### Spectrum-strategie

- De huidige spectra zijn bewust gelabeld als `predicted`.
- Ze worden afgeleid uit formule- en structuurheuristieken, niet uit experimentele peak lists.
- Reden:
  - snelle MVP-waarde
  - direct bruikbare visuele panelen
  - geen blokkerende afhankelijkheid van gefragmenteerde open spectral APIs

#### 3D rendering hergebruikt

- `src/components/StructureScene.tsx` toegevoegd als gedeelde 3D scene wrapper.
- `MoleculeViewer` gebruikt nu dezelfde renderlaag als de reaction viewer.

#### Reaction viewer uitgebreid

- `src/components/ReactionTimeline.tsx` kreeg een extra 3D sidecar.
- De reaction panel toont nu:
  - tekstuele step timeline
  - equation strip
  - conditions metadata
  - 3D looping playback van de focus molecule per step

#### Documentatie bijgewerkt

- `README.md` uitgebreid met:
  - `npm run build:catalog`
  - spectrum preview context
  - reaction 3D loop context
- `docs/research-notes.md` verduidelijkt nu expliciet dat spectra momenteel structure-derived previews zijn.

## Belangrijke technische keuzes

### Waarom PubChem als primaire databron

- breed compound-bereik
- consistente identifiers via CID
- toegankelijke PUG REST API
- 2D/3D structure records beschikbaar
- goede brug naar verdere kennisverrijking

### Waarom de grote catalogus statisch genereren

- eenvoudige MVP deployment
- geen runtime rate limiting van PubChem voor browse flows
- frontend kan snel filteren zonder backend

### Waarom spectra voorlopig predicted zijn

- open experimentele spectra zijn verspreid over meerdere bronnen
- een gecombineerd ingest-traject is groter dan de huidige MVP-scope
- predicted diagrams geven nu al nuttige visuele context onder de 3D viewer

### Waarom reactions nog geen echte mechanistische atoomanimatie zijn

- huidige 3D reaction loop toont focus states per step
- volledige bond-breaking/bond-forming animatie vraagt reaction mapping, intermediates en conformer interpolation
- dat is een volgende architectuurfase, niet meer een UI-uitbreiding

## Commands en verificatiegeschiedenis

Belangrijke commands die gebruikt zijn tijdens development:

```bash
npm install
npm run build
npm run sync:pubchem
npm run build:catalog
python3 -m http.server 4181 --bind 127.0.0.1
```

Laatste bekende succesvolle checks:

- `npm run build:catalog` -> `231` molecules
- `npm run build` -> succesvol

## Bekende beperkingen

### Bundle size

- De frontend bundle is groot door:
  - `3Dmol.js`
  - de lokale molecule-catalogus
- Later verbeteren via:
  - lazy loading
  - remote catalog loading
  - client-side pagination of virtualized listing

### Spectra

- Spectra zijn nu preview-diagrammen, geen overal experimenteel gevalideerde datasets.

### Reactions

- De 3D reaction loop toont molecule states per step.
- Er is nog geen echte geometrische transitie van reactant naar product via mapped atoms.

### Runtime data freshness

- Nieuwe PubChem compounds komen pas in de UI na een nieuwe `build:catalog` run.

## Open backlog

Prioriteit voor volgende development rondes:

1. Echte spectral ingest uit PubChem-linked records, nmrshiftdb2, MassBank en HMDB.
2. Catalogus verplaatsen naar runtime JSON fetch in plaats van bundling in de JS entry.
3. Paginatie of virtualized rendering voor de molecule browser.
4. Backend service voor ingest, refresh en provenance.
5. Reaction mechanism layer met mapped intermediates en geometrische overgangsanimaties.
6. Koppeling van papers, patents en reaction provenance per molecule en reaction.

## Werkafspraak voor toekomstige updates

Bij elke substantiële wijziging moet dit document minimaal worden bijgewerkt met:

- datum
- feature of wijziging
- relevante scripts of files
- verificatie die is uitgevoerd
- open issues of vervolgwerk
