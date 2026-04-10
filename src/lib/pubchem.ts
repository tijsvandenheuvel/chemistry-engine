import type { MoleculeRecord } from "../types/chemistry";

export function getPubChemCompoundUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
}

export function getPubChemSdfUrl(cid: number, recordType: "2d" | "3d" = "3d") {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=${recordType}`;
}

export function getPubChemPngUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;
}

export function getPubChemViewUrl(cid: number, heading?: string) {
  const suffix = heading ? `?heading=${encodeURIComponent(heading)}` : "";
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}${suffix}`;
}

export function getPubChemPugViewDataUrl(cid: number, heading: string) {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON/?heading=${encodeURIComponent(heading)}`;
}

export function getPubChemPropertyUrl(cid: number, fields: string[]) {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${fields.join(",")}/JSON`;
}

export function getPubChemGhsCodeTableUrl() {
  return "https://pubchem.ncbi.nlm.nih.gov/ghs/ghscode_11.txt";
}

export function getPubChemGhsCodeUrl(code: string) {
  return `https://pubchem.ncbi.nlm.nih.gov/ghs/#${encodeURIComponent(code)}`;
}

export function getMoleculeExternalLinks(molecule: MoleculeRecord) {
  return [
    molecule.pubchemCid
      ? {
          label: "PubChem",
          url: getPubChemCompoundUrl(molecule.pubchemCid)
        }
      : null,
    {
      label: "MassBank",
      url: "https://massbank.eu/MassBank/"
    },
    {
      label: "nmrshiftdb2",
      url: "https://nmrshiftdb.nmr.uni-koeln.de/"
    },
    {
      label: "PubChem Spectra",
      url: molecule.pubchemCid ? getPubChemViewUrl(molecule.pubchemCid, "Spectral Information") : "https://pubchem.ncbi.nlm.nih.gov/"
    }
  ].filter(Boolean) as Array<{ label: string; url: string }>;
}
