import { useEffect, useMemo, useState } from "react";
import { Atom, DatabaseZap, Orbit, Workflow } from "lucide-react";
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

const browserSections: Array<{ id: BrowserSection; label: string }> = [
  { id: "molecules", label: "Molecules" },
  { id: "atoms", label: "Atoms" },
  { id: "reactions", label: "Reactions" }
];

export default function App() {
  const [query, setQuery] = useState("");
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
    () => searchMolecules(query, categoriesBySection.molecules),
    [categoriesBySection.molecules, query]
  );
  const filteredAtoms = useMemo(
    () => searchAtoms(query, categoriesBySection.atoms),
    [categoriesBySection.atoms, query]
  );
  const filteredReactions = useMemo(
    () => searchReactions(query, categoriesBySection.reactions),
    [categoriesBySection.reactions, query]
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

  function setActiveCategory(value: string) {
    setCategoriesBySection((current) => ({ ...current, [activeSection]: value }));
  }

  function jumpToMolecule(moleculeId: string) {
    setSelectedIds((current) => ({ ...current, molecules: moleculeId }));
    setActiveSection("molecules");
  }

  function jumpToAtom(atomId: string) {
    setSelectedIds((current) => ({ ...current, atoms: atomId }));
    setActiveSection("atoms");
  }

  function jumpToReaction(reactionId: string) {
    setSelectedIds((current) => ({ ...current, reactions: reactionId }));
    setActiveSection("reactions");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Chemie Engine MVP</p>
          <h1>
            Molecules, atoms and reactions in one connected chemistry workspace.
          </h1>
          <p className="hero-text">
            Deze pass brengt de visualisaties verder: atoms krijgen modelweergaven voor shells,
            valentie en periodieke context, terwijl reactions een duidelijkere visual pass krijgen
            waarin input, transitie en output naast de bestaande 3D loop zichtbaar blijven.
          </p>
        </div>

        <div className="hero-metrics">
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
      </section>

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

              <section className="panel detail-panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Reaction Network</p>
                    <h2>{selectedReaction.name}</h2>
                  </div>
                  <div className="count-chip">{reactionMolecules.length} linked molecules</div>
                </div>

                <div className="detail-columns">
                  <article className="subpanel">
                    <h3>Browse molecules</h3>
                    <div className="browser-link-list">
                      {reactionMolecules.map((molecule) => (
                        <button
                          key={molecule.id}
                          type="button"
                          className="browser-link-card"
                          onClick={() => jumpToMolecule(molecule.id)}
                        >
                          <div>
                            <strong>{molecule.name}</strong>
                            <p>{molecule.formula}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </article>

                  <article className="subpanel">
                    <h3>Browse involved atoms</h3>
                    <div className="tag-row">
                      {reactionAtoms.map((atom) => (
                        <button
                          key={atom.id}
                          type="button"
                          className="chip"
                          onClick={() => jumpToAtom(atom.id)}
                        >
                          {atom.symbol} · {atom.name}
                        </button>
                      ))}
                    </div>
                  </article>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
