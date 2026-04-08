import { useMemo, useState } from "react";
import { DatabaseZap, Dna, Orbit, Workflow } from "lucide-react";
import { molecules, moleculeMap, reactions, getCategoryFacets, searchMolecules } from "./lib/catalog";
import { MoleculeBrowser } from "./components/MoleculeBrowser";
import { MoleculeDetails } from "./components/MoleculeDetails";
import { MoleculeViewer } from "./components/MoleculeViewer";
import { ReactionTimeline } from "./components/ReactionTimeline";
import { SpectralPanel } from "./components/SpectralPanel";

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(molecules[0]?.id ?? "");
  const categories = useMemo(() => getCategoryFacets(), []);
  const filtered = useMemo(() => searchMolecules(query, category), [category, query]);
  const spectrumCount = useMemo(
    () => molecules.reduce((total, molecule) => total + molecule.spectra.length, 0),
    []
  );

  const selectedMolecule = useMemo(() => {
    const fromFilter = filtered.find((molecule) => molecule.id === selectedId);
    return fromFilter ?? filtered[0] ?? molecules[0];
  }, [filtered, selectedId]);

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Chemie Engine MVP</p>
          <h1>
            Molecule browser, 3D rendering and reaction storytelling in one
            interface.
          </h1>
          <p className="hero-text">
            Deze eerste versie focust op gekende structuren: je kunt molecules
            selecteren, ze in 3D bekijken, reaction flows afspelen en de basis
            leggen voor een eigen chemistry knowledge system.
          </p>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <DatabaseZap size={20} />
            <strong>{molecules.length}</strong>
            <span>catalog molecules</span>
          </article>
          <article className="metric-card">
            <Orbit size={20} />
            <strong>3D</strong>
            <span>PubChem-backed viewer</span>
          </article>
          <article className="metric-card">
            <Workflow size={20} />
            <strong>{spectrumCount}</strong>
            <span>spectral profiles</span>
          </article>
          <article className="metric-card">
            <Dna size={20} />
            <strong>{reactions.length}</strong>
            <span>reaction storyboards</span>
          </article>
        </div>
      </section>

      <section className="workspace-grid">
        <MoleculeBrowser
          molecules={filtered}
          selectedId={selectedMolecule.id}
          categories={categories}
          activeCategory={category}
          query={query}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
        />

        <div className="main-column">
          <MoleculeViewer molecule={selectedMolecule} />
          <SpectralPanel molecule={selectedMolecule} />
          <MoleculeDetails molecule={selectedMolecule} />
        </div>
      </section>

      <ReactionTimeline reactions={reactions} molecules={moleculeMap} />
    </main>
  );
}
