import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Atom, DatabaseZap, Orbit, TableProperties, Workflow } from "lucide-react";
import {
  atoms,
  getCategoryFacets,
  getMoleculesForAtom,
  getMoleculesForReaction,
  getReactionsForAtom,
  getReactionsForMolecule,
  moleculeMap,
  molecules,
  reactions,
  searchAtoms,
  searchMolecules,
  searchReactions
} from "./lib/catalog";
import type { BrowserSection } from "./types/chemistry";
import { MoleculeBrowser } from "./components/MoleculeBrowser";
import { MoleculeDetails } from "./components/MoleculeDetails";
import { MoleculeViewer } from "./components/MoleculeViewer";
import { ReactionTimeline } from "./components/ReactionTimeline";
import { SpectralPanel } from "./components/SpectralPanel";
import { AtomPanel } from "./components/AtomPanel";
import { ReactionDetails } from "./components/ReactionDetails";
import { PeriodicTableView } from "./components/PeriodicTableView";
import { periodicTable } from "./data/periodic-table";

const browserSections: Array<{ id: BrowserSection; label: string }> = [
  { id: "molecules", label: "Molecules" },
  { id: "atoms", label: "Atoms" },
  { id: "reactions", label: "Reactions" }
];

export default function App() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [appView, setAppView] = useState<"workspace" | "periodic-table">("workspace");
  const [selectedPeriodicAtomicNumber, setSelectedPeriodicAtomicNumber] = useState<number>(atoms[0]?.atomicNumber ?? 1);
  const [activeSection, setActiveSection] = useState<BrowserSection>("molecules");
  const [selectedIds, setSelectedIds] = useState<Record<BrowserSection, string>>({
    molecules: molecules[0]?.id ?? "",
    atoms: atoms[0]?.id ?? "",
    reactions: reactions[0]?.id ?? ""
  });
  const [categoriesBySection, setCategoriesBySection] = useState<Record<BrowserSection, string>>({
    molecules: "all",
    atoms: "all",
    reactions: "all"
  });

  const filteredMolecules = useMemo(
    () => searchMolecules(deferredQuery, categoriesBySection.molecules),
    [categoriesBySection.molecules, deferredQuery]
  );
  const filteredAtoms = useMemo(
    () => searchAtoms(deferredQuery, categoriesBySection.atoms),
    [categoriesBySection.atoms, deferredQuery]
  );
  const filteredReactions = useMemo(
    () => searchReactions(deferredQuery, categoriesBySection.reactions),
    [categoriesBySection.reactions, deferredQuery]
  );
  const categories = useMemo(() => getCategoryFacets(activeSection), [activeSection]);
  const spectrumCount = useMemo(
    () => molecules.reduce((total, molecule) => total + molecule.spectra.length, 0),
    []
  );

  useEffect(() => {
    const selectedMoleculeVisible = filteredMolecules.some((molecule) => molecule.id === selectedIds.molecules);
    if (!selectedMoleculeVisible && filteredMolecules[0]) {
      setSelectedIds((current) => ({ ...current, molecules: filteredMolecules[0].id }));
    }
  }, [filteredMolecules, selectedIds.molecules]);

  useEffect(() => {
    const selectedAtomVisible = filteredAtoms.some((atom) => atom.id === selectedIds.atoms);
    if (!selectedAtomVisible && filteredAtoms[0]) {
      setSelectedIds((current) => ({ ...current, atoms: filteredAtoms[0].id }));
    }
  }, [filteredAtoms, selectedIds.atoms]);

  useEffect(() => {
    const selectedReactionVisible = filteredReactions.some((reaction) => reaction.id === selectedIds.reactions);
    if (!selectedReactionVisible && filteredReactions[0]) {
      setSelectedIds((current) => ({ ...current, reactions: filteredReactions[0].id }));
    }
  }, [filteredReactions, selectedIds.reactions]);

  const selectedMolecule = useMemo(() => {
    return filteredMolecules.find((molecule) => molecule.id === selectedIds.molecules) ?? filteredMolecules[0] ?? molecules[0];
  }, [filteredMolecules, selectedIds.molecules]);

  const selectedAtom = useMemo(() => {
    return filteredAtoms.find((atom) => atom.id === selectedIds.atoms) ?? filteredAtoms[0] ?? atoms[0];
  }, [filteredAtoms, selectedIds.atoms]);

  const selectedReaction = useMemo(() => {
    return (
      filteredReactions.find((reaction) => reaction.id === selectedIds.reactions) ??
      filteredReactions[0] ??
      reactions[0]
    );
  }, [filteredReactions, selectedIds.reactions]);

  const relatedMoleculeReactions = useMemo(
    () => (selectedMolecule ? getReactionsForMolecule(selectedMolecule.id) : []),
    [selectedMolecule]
  );
  const relatedAtomMolecules = useMemo(
    () => (selectedAtom ? getMoleculesForAtom(selectedAtom.id) : []),
    [selectedAtom]
  );
  const relatedAtomReactions = useMemo(
    () => (selectedAtom ? getReactionsForAtom(selectedAtom.id) : []),
    [selectedAtom]
  );
  const reactionMolecules = useMemo(
    () => (selectedReaction ? getMoleculesForReaction(selectedReaction) : []),
    [selectedReaction]
  );
  const visibleReactionBrowserList = useMemo(
    () => (filteredReactions.length > 0 ? filteredReactions : selectedReaction ? [selectedReaction] : []),
    [filteredReactions, selectedReaction]
  );
  const reactionAtoms = useMemo(
    () =>
      atoms.filter((atom) =>
        reactionMolecules.some((molecule) => atom.relatedMoleculeIds.includes(molecule.id))
      ),
    [reactionMolecules]
  );

  useEffect(() => {
    if (selectedAtom) {
      setSelectedPeriodicAtomicNumber(selectedAtom.atomicNumber);
    }
  }, [selectedAtom]);

  function setActiveCategory(value: string) {
    setCategoriesBySection((current) => ({ ...current, [activeSection]: value }));
  }

  function jumpToMolecule(moleculeId: string) {
    setSelectedIds((current) => ({ ...current, molecules: moleculeId }));
    setActiveSection("molecules");
    setAppView("workspace");
  }

  function jumpToAtom(atomId: string) {
    setSelectedIds((current) => ({ ...current, atoms: atomId }));
    setActiveSection("atoms");
    setAppView("workspace");
  }

  function jumpToReaction(reactionId: string) {
    setSelectedIds((current) => ({ ...current, reactions: reactionId }));
    setActiveSection("reactions");
    setAppView("workspace");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <p className="eyebrow">Chemie Engine</p>
          <h1>Chemistry workspace</h1>
        </div>

        <nav className="app-nav" aria-label="Primary workspace navigation">
          <button
            type="button"
            className={appView === "workspace" ? "chip active app-nav-button" : "chip app-nav-button"}
            onClick={() => setAppView("workspace")}
          >
            <Orbit size={14} />
            <span>Workspace</span>
          </button>
          <button
            type="button"
            className={appView === "periodic-table" ? "chip active app-nav-button" : "chip app-nav-button"}
            onClick={() => setAppView("periodic-table")}
          >
            <TableProperties size={14} />
            <span>Mendeleev View</span>
          </button>
        </nav>

        <div className="app-header-metrics">
          <article className="metric-card">
            <DatabaseZap size={20} />
            <strong>{molecules.length}</strong>
            <span>catalog molecules</span>
          </article>
          <article className="metric-card">
            <Atom size={20} />
            <strong>{atoms.length}</strong>
            <span>tracked atoms in catalog</span>
          </article>
          <article className="metric-card">
            <Workflow size={20} />
            <strong>{reactions.length}</strong>
            <span>chemical reactions</span>
          </article>
          <article className="metric-card">
            <Orbit size={20} />
            <strong>{spectrumCount}</strong>
            <span>spectral profiles</span>
          </article>
        </div>
      </header>

      {appView === "periodic-table" ? (
        <PeriodicTableView
          elements={periodicTable}
          curatedAtoms={atoms}
          selectedAtomicNumber={selectedPeriodicAtomicNumber}
          onSelectAtomicNumber={setSelectedPeriodicAtomicNumber}
          onOpenCuratedAtom={jumpToAtom}
        />
      ) : (
        <section className="workspace-grid">
          <MoleculeBrowser
            activeSection={activeSection}
            sections={browserSections.map((section) => ({
              ...section,
              count:
                section.id === "molecules"
                  ? molecules.length
                  : section.id === "atoms"
                    ? atoms.length
                    : reactions.length
            }))}
            molecules={filteredMolecules}
            atoms={filteredAtoms}
            reactions={filteredReactions}
            selectedIds={selectedIds}
            categories={categories}
            activeCategory={categoriesBySection[activeSection]}
            query={query}
            onSectionChange={(section) => {
              setActiveSection(section);
              setQuery("");
            }}
            onCategoryChange={setActiveCategory}
            onQueryChange={setQuery}
            onSelectMolecule={jumpToMolecule}
            onSelectAtom={jumpToAtom}
            onSelectReaction={jumpToReaction}
          />

          <div className="main-column">
            {activeSection === "molecules" && selectedMolecule ? (
              <>
                <MoleculeViewer molecule={selectedMolecule} />
                <SpectralPanel molecule={selectedMolecule} />
                <MoleculeDetails
                  molecule={selectedMolecule}
                  relatedReactions={relatedMoleculeReactions}
                  onSelectReaction={jumpToReaction}
                />
                <ReactionTimeline
                  reactions={relatedMoleculeReactions.length > 0 ? relatedMoleculeReactions : reactions}
                  molecules={moleculeMap}
                  selectedReactionId={selectedIds.reactions}
                  onSelectReaction={jumpToReaction}
                  onSelectMolecule={jumpToMolecule}
                />
              </>
            ) : null}

            {activeSection === "atoms" && selectedAtom ? (
              <AtomPanel
                atom={selectedAtom}
                relatedMolecules={relatedAtomMolecules}
                relatedReactions={relatedAtomReactions}
                onSelectMolecule={jumpToMolecule}
                onSelectReaction={jumpToReaction}
              />
            ) : null}

            {activeSection === "reactions" && selectedReaction ? (
              <>
                <ReactionTimeline
                  reactions={visibleReactionBrowserList}
                  molecules={moleculeMap}
                  selectedReactionId={selectedReaction.id}
                  onSelectReaction={jumpToReaction}
                  onSelectMolecule={jumpToMolecule}
                />

                <ReactionDetails
                  reaction={selectedReaction}
                  molecules={reactionMolecules}
                  atoms={reactionAtoms}
                  onSelectMolecule={jumpToMolecule}
                  onSelectAtom={jumpToAtom}
                />
              </>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
