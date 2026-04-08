import type {
  AtomRecord,
  MoleculeRecord,
  PeriodicElementRecord,
  ReactionRecord
} from "../types/chemistry";
import { getMoleculeExternalLinks } from "./pubchem";

export interface SourceEntry {
  id: string;
  kind: string;
  label: string;
  detail: string;
  url: string;
  badge: string;
}

export function getMoleculeSourceEntries(molecule: MoleculeRecord): SourceEntry[] {
  const spectralEntries = molecule.spectralReferences.map((reference, index) => ({
    id: `${molecule.id}-reference-${index}`,
    kind: reference.kind,
    label: reference.label,
    detail: reference.notes,
    url: reference.url,
    badge: reference.availability
  }));
  const externalEntries = getMoleculeExternalLinks(molecule).map((link, index) => ({
    id: `${molecule.id}-external-${index}`,
    kind: "Research",
    label: link.label,
    detail: "External reference entry point for compound, spectra or related literature context.",
    url: link.url,
    badge: "external"
  }));

  return [...spectralEntries, ...externalEntries];
}

function getAtomSourceEntriesByName(name: string, symbol: string): SourceEntry[] {
  return [
    {
      id: `${symbol}-ciaaw`,
      kind: "Weights",
      label: "CIAAW",
      detail: `Reference basis for standard atomic-weight context around ${name}.`,
      url: "https://ciaaw.org/",
      badge: "reference"
    },
    {
      id: `${symbol}-nist`,
      kind: "Spectra",
      label: "NIST ASD",
      detail: `Atomic spectra entry point for ${name} (${symbol}).`,
      url: "https://physics.nist.gov/PhysRefData/ASD/",
      badge: "reference"
    },
    {
      id: `${symbol}-pubchem`,
      kind: "Research",
      label: "PubChem Search",
      detail: `External chemistry search entry point for ${name}.`,
      url: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(name)}`,
      badge: "search"
    }
  ];
}

export function getAtomSourceEntries(atom: AtomRecord): SourceEntry[] {
  return getAtomSourceEntriesByName(atom.name, atom.symbol);
}

export function getPeriodicElementSourceEntries(element: PeriodicElementRecord): SourceEntry[] {
  return getAtomSourceEntriesByName(element.name, element.symbol);
}

export function getReactionSourceEntries(reaction: ReactionRecord): SourceEntry[] {
  return [
    {
      id: `${reaction.id}-rhea`,
      kind: "Reaction",
      label: "Rhea",
      detail: `Search open curated reaction records that match ${reaction.name}.`,
      url: `https://www.rhea-db.org/searchresults?q=${encodeURIComponent(reaction.name)}`,
      badge: "curated"
    },
    {
      id: `${reaction.id}-ord`,
      kind: "Reaction",
      label: "Open Reaction Database",
      detail: "Open reaction record corpus and schema reference for later provenance expansion.",
      url: "https://open-reaction-database.org/",
      badge: "open"
    },
    {
      id: `${reaction.id}-pubchem`,
      kind: "Research",
      label: "PubChem Search",
      detail: `Search external compound and reaction context linked to ${reaction.name}.`,
      url: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(reaction.name)}`,
      badge: "search"
    }
  ];
}
