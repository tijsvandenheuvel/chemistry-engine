import { Atom as AtomIcon, Orbit } from "lucide-react";
import type { AtomRecord, PeriodicElementRecord } from "../types/chemistry";
import { SourcesSection } from "./SourcesSection";
import { getAtomSourceEntries } from "../lib/sources";

interface PeriodicTableViewProps {
  elements: PeriodicElementRecord[];
  atoms: AtomRecord[];
  selectedAtomicNumber: number;
  onSelectAtomicNumber: (atomicNumber: number) => void;
  onOpenAtomModal: (atomId: string) => void;
}

export function PeriodicTableView({
  elements,
  atoms,
  selectedAtomicNumber,
  onSelectAtomicNumber,
  onOpenAtomModal
}: PeriodicTableViewProps) {
  const atomMapByNumber = new Map(atoms.map((atom) => [atom.atomicNumber, atom]));
  const selectedElement =
    elements.find((element) => element.atomicNumber === selectedAtomicNumber) ?? elements[0];
  const selectedAtom = atomMapByNumber.get(selectedElement.atomicNumber);
  const sourceEntries = selectedAtom ? getAtomSourceEntries(selectedAtom) : [];

  return (
    <section className="periodic-layout">
      <section className="panel periodic-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Mendeleev View</p>
            <h2>Periodic Table Navigator</h2>
          </div>
          <div className="count-chip">{elements.length} elements</div>
        </div>

        <p className="detail-intro compact-intro">
          Gebruik de tabel om door alle elementen te navigeren. Elementen die al in de huidige
          chemistry graph zitten krijgen een accent, maar de tabel zelf dekt alle `118` posities.
        </p>

        <div className="periodic-grid">
          {elements.map((element) => {
            const isSelected = element.atomicNumber === selectedElement.atomicNumber;
            const atom = atomMapByNumber.get(element.atomicNumber);
            const isCurated = atom?.coverage === "curated";

            return (
              <button
                key={element.atomicNumber}
                type="button"
                className={
                  isSelected
                    ? isCurated
                      ? "element-tile selected curated"
                      : "element-tile selected"
                    : isCurated
                      ? "element-tile curated"
                      : "element-tile"
                }
                style={{
                  gridColumn: element.tableColumn,
                  gridRow: element.tableRow
                }}
                onClick={() => {
                  onSelectAtomicNumber(element.atomicNumber);
                  if (atom) {
                    onOpenAtomModal(atom.id);
                  }
                }}
              >
                <span>{element.atomicNumber}</span>
                <strong>{element.symbol}</strong>
                <small>{element.name}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel detail-panel periodic-detail-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Element Focus</p>
            <h2>{selectedElement.name}</h2>
          </div>
          <div className="viewer-status">
            <AtomIcon size={16} />
            <span>{selectedElement.symbol}</span>
          </div>
        </div>

        <div className="periodic-focus-card">
          <div className="periodic-focus-top">
            <span>{selectedElement.atomicNumber}</span>
            <strong>{selectedElement.symbol}</strong>
            <small>{selectedElement.category}</small>
          </div>

          <div className="stats-grid compact-stats-grid">
            <article className="stat-card">
              <span>Atomic weight</span>
              <strong>{selectedElement.atomicWeight.toFixed(3)}</strong>
            </article>
            <article className="stat-card">
              <span>Phase</span>
              <strong>{selectedElement.phase}</strong>
            </article>
            <article className="stat-card">
              <span>Period</span>
              <strong>{selectedElement.period}</strong>
            </article>
            <article className="stat-card">
              <span>Group</span>
              <strong>{selectedElement.group}</strong>
            </article>
          </div>
        </div>

        <div className="detail-stack">
          <article className="subpanel">
            <div className="subpanel-head">
              <h3>Curated graph status</h3>
              <Orbit size={16} />
            </div>
            <p className="detail-intro compact-intro">
              {selectedAtom?.coverage === "curated"
                ? `${selectedElement.name} is already present as a curated atom record in the chemistry graph.`
                : `${selectedElement.name} is now available in the atom viewer through the periodic-table dataset, even when it is not linked to the current molecule catalog.`}
            </p>

            {selectedAtom ? (
              <button
                type="button"
                className="browser-link-card open-dossier-button"
                onClick={() => onOpenAtomModal(selectedAtom.id)}
              >
                <div>
                  <strong>Open atom viewer modal</strong>
                  <p>Open the full atom viewer directly from the periodic table.</p>
                </div>
              </button>
            ) : null}
          </article>

          <SourcesSection
            entries={sourceEntries}
            preview="Reference links for periodic-table context and external atom research."
          />
        </div>
      </section>
    </section>
  );
}
