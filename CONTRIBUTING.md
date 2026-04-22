# Contributing

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Data and Source Hygiene

- Do not commit raw upstream snapshot bundles into `public/`.
- Keep generated PubChem snapshot files in `data/pubchem/` only.
- Preserve the distinction between source-backed facts and modelled or predicted output.

## Pull Requests

- Keep changes focused and explain user-visible impact.
- Run `npm run build` before opening a pull request.
- Note any chemistry-data provenance changes in the pull request description.

## Security

- Do not disclose suspected vulnerabilities in public issues.
- Follow [SECURITY.md](SECURITY.md) for sensitive reports.
