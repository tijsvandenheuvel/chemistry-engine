export type SpectrumKind = "1H NMR" | "13C NMR" | "IR" | "MS" | "MS/MS" | "UV/Vis" | "Record";

export interface SpectrumPeak {
  position: number;
  intensity: number;
  width?: number;
  label?: string;
}

export interface SpectrumProfile {
  id: string;
  kind: SpectrumKind;
  mode: "predicted" | "measured";
  title: string;
  summary: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  reverseX?: boolean;
  peaks: SpectrumPeak[];
}

export interface SpectrumReference {
  kind: SpectrumKind;
  label: string;
  source: string;
  url: string;
  availability: "open" | "restricted" | "planned";
  notes: string;
}

export interface MoleculeRecord {
  id: string;
  name: string;
  iupac: string;
  formula: string;
  pubchemCid?: number;
  smiles: string;
  description: string;
  categories: string[];
  uses: string[];
  hazardNotes: string[];
  molecularWeight: number;
  xlogp?: number;
  tpsa?: number;
  hBondDonors?: number;
  hBondAcceptors?: number;
  exactMass?: number;
  complexity?: number;
  charge?: number;
  sourceDatabase?: string;
  spectralReferences: SpectrumReference[];
  spectra: SpectrumProfile[];
}

export interface ReactionStep {
  title: string;
  description: string;
  focusMoleculeId?: string;
}

export interface ReactionRecord {
  id: string;
  name: string;
  summary: string;
  reactants: string[];
  products: string[];
  catalysts: string[];
  solvent?: string;
  temperature?: string;
  notes: string;
  steps: ReactionStep[];
}
