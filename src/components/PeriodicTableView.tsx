import { ArrowRight, Atom as AtomIcon, Orbit } from "lucide-react";
import type { AtomRecord, PeriodicElementRecord } from "../types/chemistry";
import { SourcesSection } from "./SourcesSection";
import { getPeriodicElementSourceEntries } from "../lib/sources";

interface PeriodicTableViewProps {
  elements: PeriodicElementRecord[];
  curatedAtoms: AtomRecord[];
  selectedAtomicNumber: number;
  onSelectAtomicNumber: (atomicNumber: number) => void;
  onOpenCuratedAtom: (atomId: string) => void;
}

export function PeriodicTableView({
  elements,
  curatedAtoms,
  selectedAtomicNumber,
  onSelectAtomicNumber,
  onOpenCuratedAtom
}: PeriodicTableViewProps) {
  const curatedAtomMap = new Map(curatedAtoms.map((atom) => [atom.atomicNumber, atom]));
  const selectedElement =
    elements.find((element) => element.atomicNumber === selectedAtomicNumber) ?? elements[0];
  const curatedAtom = curatedAtomMap.get(selectedElement.atomicNumber);
  const sourceEntries = getPeriodicElementSourceEntries(selectedElement);

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
            const isCurated = curatedAtomMap.has(element.atomicNumber);

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
                onClick={() => onSelectAtomicNumber(element.atomicNumber)}
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
              {curatedAtom
                ? `${selectedElement.name} is already present in the current curated atom graph and can be opened in the main workspace dossier.`
                : `${selectedElement.name} is available here for full periodic-table navigation, but does not yet have a full curated dossier in the chemistry graph.`}
            </p>

            {curatedAtom ? (
              <button
                type="button"
                className="browser-link-card open-dossier-button"
                onClick={() => onOpenCuratedAtom(curatedAtom.id)}
              >
                <div>
                  <strong>Open curated atom dossier</strong>
                  <p>Jump back into the main workspace atom panel.</p>
                </div>
                <ArrowRight size={14} />
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
