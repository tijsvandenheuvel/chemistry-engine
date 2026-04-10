export type SpectrumKind = "1H NMR" | "13C NMR" | "IR" | "MS" | "MS/MS" | "UV/Vis" | "Record";
export type BrowserSection = "molecules" | "atoms" | "reactions";

export interface PeriodicElementRecord {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;
  group: number;
  tableColumn: number;
  tableRow: number;
  category: string;
  phase: string;
  atomicWeight: number;
}

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

export interface SafetyPictogram {
  code: string;
  label: string;
  url: string;
}

export interface SafetyStatement {
  code: string;
  text: string;
  url?: string;
}

export interface SafetyPropertyRecord {
  label: string;
  value: string;
  source?: string;
}

export interface SafetySourceReference {
  label: string;
  url: string;
  kind: "safety" | "physical" | "regulatory" | "reference";
}

export interface MoleculeSafetyRecord {
  status: "source-backed" | "summary-only" | "source-unavailable";
  sourceLabel: string;
  summary: string;
  signalWord?: string;
  pictograms: SafetyPictogram[];
  hazardStatements: SafetyStatement[];
  precautionaryStatements: SafetyStatement[];
  physicalProperties: SafetyPropertyRecord[];
  handlingNotes: string[];
  sourceLinks: SafetySourceReference[];
  note?: string;
  fetchedAt?: string;
}

export interface ReactionParticipantSafetyRecord {
  moleculeId: string;
  moleculeName: string;
  status: MoleculeSafetyRecord["status"];
  signalWord?: string;
  pictograms: SafetyPictogram[];
  hazardStatements: SafetyStatement[];
  precautionaryStatements: SafetyStatement[];
}

export interface ReactionSafetyRecord {
  status: "participant-derived" | "modelled-process";
  summary: string;
  primaryHazards: string[];
  controls: string[];
  ppe: string[];
  watchpoints: string[];
  participants: ReactionParticipantSafetyRecord[];
  participantCoverage: {
    sourceBacked: number;
    total: number;
  };
  note: string;
}

export type VerificationStatus = "verified" | "conflict" | "single-source" | "pending" | "modelled";
export type VerificationSourceState = "checked" | "reference" | "pending" | "failed";

export interface VerificationSourceRecord {
  id: string;
  label: string;
  detail: string;
  state: VerificationSourceState;
  url?: string;
}

export interface VerificationObservation {
  sourceId: string;
  sourceLabel: string;
  value: string;
}

export interface VerificationFieldRecord {
  id: string;
  label: string;
  status: VerificationStatus;
  canonicalValue: string;
  observations: VerificationObservation[];
  note?: string;
}

export interface VerificationReport {
  kind: "molecule" | "atom" | "reaction";
  overallStatus: VerificationStatus;
  summary: string;
  sources: VerificationSourceRecord[];
  fields: VerificationFieldRecord[];
  notes: string[];
  counts: {
    verified: number;
    conflict: number;
    singleSource: number;
    pending: number;
    modelled: number;
  };
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

export interface AtomRecord {
  id: string;
  symbol: string;
  name: string;
  coverage: "curated" | "periodic-table";
  atomicNumber: number;
  atomicWeight: number;
  category: string;
  phase: string;
  period: number;
  group: number;
  electronConfiguration: string;
  oxidationStates: string[];
  description: string;
  relatedMoleculeIds: string[];
  relatedReactionIds: string[];
}

export interface ReactionStep {
  title: string;
  description: string;
  focusMoleculeId?: string;
}

export interface ReactionRecord {
  id: string;
  name: string;
  categories: string[];
  summary: string;
  reactants: string[];
  products: string[];
  catalysts: string[];
  solvent?: string;
  temperature?: string;
  notes: string;
  steps: ReactionStep[];
}
