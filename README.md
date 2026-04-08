# Chemie Engine

Een compacte chemistry workbench MVP met:

- een compacte chemistry browser voor molecules, atoms en reactions
- een 3D viewer voor bekende moleculen
- een spectral panel met structure-derived spectrum previews
- geanimeerde reaction views
- een seed-database met molecules en reaction metadata
- een PubChem importscript om de catalogus verder te verrijken
- een PubChem catalog builder voor honderden molecules

## Starten

```bash
npm install
npm run dev
```

De app draait standaard op `http://localhost:4173`.

## Build

```bash
npm run build
```

## PubChem sync

Het script leest de seed-database, haalt enrichment op uit PubChem PUG REST en schrijft snapshots weg naar `data/pubchem/`.

```bash
npm run sync:pubchem
```

## Grote catalogus bouwen

Dit script vult de catalogus met honderden compounds uit PubChem over verschillende chemische families.

```bash
npm run build:catalog
```

## Development documentatie

Gedetailleerde procesdocumentatie staat in:

- `docs/development-log.md`
- `docs/research-notes.md`

## MVP scope

De huidige versie focust op:

- renderen van basis-moleculen met bekende structuur
- overzichtelijke chemistry catalogus met scrollbare browserkolom en type-afhankelijke filters
- molecule, atom en reaction browsing in dezelfde interface
- detailpaneel met properties, bronnen en spectra-ingangen
- structure-derived spectral diagrams onder de 3D viewer
- reaction storyboards met 3D loop playback

Aanbevolen volgende stap: spectra uit `MassBank`, `nmrshiftdb2`, `GNPS`, `HMDB` en papers automatiseren in een ingest pipeline.
