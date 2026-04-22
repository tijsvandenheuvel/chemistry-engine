# Chemistry Engine

Een compacte chemistry workbench MVP met:

- een compacte chemistry browser voor molecules, atoms en reactions
- een 3D viewer voor bekende moleculen
- een spectral panel met structure-derived spectrum previews
- geanimeerde reaction views
- een seed-database met molecules, atoms en reaction metadata
- een PubChem importscript om de catalogus verder te verrijken
- een PubChem catalog builder voor honderden molecules

De huidige repo-status op `2026-04-08`:

- `231` molecules in de catalogus
- `13` atoms in de huidige atom seed-set
- `3` curated reactions
- `895` spectral profiles, momenteel vooral structure-derived previews

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

Het script leest de seed-database, haalt enrichment op uit PubChem PUG REST en schrijft lokale snapshots weg naar `data/pubchem/`.

```bash
npm run sync:pubchem
```

## Grote catalogus bouwen

Dit script vult de catalogus met honderden compounds uit PubChem over verschillende chemische families.

```bash
npm run build:catalog
```

## Documentatie

Repo-brede documentatie staat in:

- `docs/handoff-report.md`
- `docs/next-phase-roadmap.md`
- `docs/development-log.md`
- `docs/research-notes.md`

Gebruik deze documenten als engineering-notities voor:

- huidige MVP-status
- architectuurrichting
- bronstrategie
- eerstvolgende uitbreidingsfase

## GitHub Pages

De repo bevat een GitHub Actions workflow die `dist/` naar GitHub Pages kan publiceren.
De productie-build gebruikt een Pages-specifieke base path, zodat assets ook onder `/<repo>/` correct laden.

## Publieke deployment-notities

- Ruwe PubChem snapshots worden niet naar `public/` geschreven en zitten dus niet in de GitHub Pages build.
- Bronverrijking voor safety- en verification-panels komt live van PubChem tijdens runtime.
- Externe bronlinks worden in de UI alleen klikbaar gemaakt wanneer ze een veilige `http(s)` URL hebben.

## MVP scope

De huidige versie focust op:

- renderen van basis-moleculen met bekende structuur
- overzichtelijke chemistry catalogus met scrollbare browserkolom en type-afhankelijke filters
- molecule, atom en reaction browsing in dezelfde interface
- detailpaneel met properties, bronnen en spectra-ingangen
- structure-derived spectral diagrams onder de 3D viewer
- reaction storyboards met 3D loop playback

## Waarheidsregel

- Exacte chemische data moet bronvast en betrouwbaar zijn.
- Predicted spectra mogen niet als experimentele waarheid worden gepresenteerd.
- Exacte reaction facts en gemodelleerde visualisaties moeten expliciet onderscheiden worden.

## Volgende fase

De eerstvolgende deliveryfase is vastgelegd in `docs/next-phase-roadmap.md` en focust op:

- visualisaties van atoommodellen
- rijkere reaction visualisaties met exact-vs-modelled labeling
- een curated databank van ongeveer `50` algemene chemische reacties
