import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "src", "data", "molecules.catalog.json");
const outputDirs = [path.join(rootDir, "data", "pubchem")];

const propertyFields = [
  "MolecularFormula",
  "MolecularWeight",
  "CanonicalSMILES",
  "IsomericSMILES",
  "InChI",
  "InChIKey",
  "XLogP",
  "TPSA",
  "HBondDonorCount",
  "HBondAcceptorCount"
].join(",");

async function loadSeeds() {
  const raw = await readFile(seedPath, "utf8");
  return JSON.parse(raw);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "chemie-engine/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`PubChem request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "chemie-engine/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`PubChem text request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

async function fetchPubChemBundle(molecule) {
  if (!molecule.pubchemCid) {
    return null;
  }

  const cid = molecule.pubchemCid;
  const propertiesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${propertyFields}/JSON`;
  const descriptionUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON/?heading=Record+Description`;
  const synonymsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`;
  const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`;

  const [properties, description, synonyms, sdf] = await Promise.allSettled([
    fetchJson(propertiesUrl),
    fetchJson(descriptionUrl),
    fetchJson(synonymsUrl),
    fetchText(sdfUrl)
  ]);

  return {
    moleculeId: molecule.id,
    name: molecule.name,
    pubchemCid: cid,
    fetchedAt: new Date().toISOString(),
    properties: properties.status === "fulfilled" ? properties.value : null,
    description: description.status === "fulfilled" ? description.value : null,
    synonyms: synonyms.status === "fulfilled" ? synonyms.value : null,
    sdf: sdf.status === "fulfilled" ? sdf.value : null,
    errors: [properties, description, synonyms, sdf]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason))
  };
}

async function main() {
  const seeds = await loadSeeds();
  await Promise.all(outputDirs.map((directory) => mkdir(directory, { recursive: true })));

  for (const molecule of seeds) {
    if (!molecule.pubchemCid) {
      continue;
    }

    const bundle = await fetchPubChemBundle(molecule);

    if (!bundle) {
      continue;
    }

    await Promise.all(
      outputDirs.map(async (directory) => {
        const outputPath = path.join(directory, `${molecule.id}.json`);
        await writeFile(outputPath, JSON.stringify(bundle, null, 2), "utf8");
        console.log(`saved ${outputPath}`);
      })
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
