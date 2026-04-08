import type { CSSProperties } from "react";
import type { AtomRecord } from "../types/chemistry";
import { estimateNeutronCount, getElectronShellOccupancy, getValenceElectronCount } from "../lib/atom-models";

export type AtomVisualizationMode = "shell" | "valence" | "periodic";

interface AtomModelSceneProps {
  atom: AtomRecord;
  mode: AtomVisualizationMode;
}

const shellLabels = ["K", "L", "M", "N", "O", "P", "Q"];
const sceneCenter = 200;

function getShellRadius(index: number) {
  return 58 + index * 34;
}

function getElectronPositions(electronCount: number, radius: number) {
  return Array.from({ length: electronCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / electronCount - Math.PI / 2;
    return {
      x: sceneCenter + Math.cos(angle) * radius,
      y: sceneCenter + Math.sin(angle) * radius
    };
  });
}

export function AtomModelScene({ atom, mode }: AtomModelSceneProps) {
  const shells = getElectronShellOccupancy(atom.atomicNumber);
  const valenceElectrons = getValenceElectronCount(atom.atomicNumber);
  const neutronEstimate = estimateNeutronCount(atom.atomicWeight, atom.atomicNumber);

  if (mode === "periodic") {
    return (
      <div className="atom-periodic-card">
        <div className="atom-periodic-top">
          <span>{atom.atomicNumber}</span>
          <small>{atom.category}</small>
        </div>

        <strong>{atom.symbol}</strong>
        <h3>{atom.name}</h3>

        <div className="atom-periodic-meta">
          <article>
            <span>Weight</span>
            <strong>{atom.atomicWeight.toFixed(3)}</strong>
          </article>
          <article>
            <span>Phase</span>
            <strong>{atom.phase}</strong>
          </article>
          <article>
            <span>Period</span>
            <strong>{atom.period}</strong>
          </article>
          <article>
            <span>Group</span>
            <strong>{atom.group}</strong>
          </article>
        </div>
      </div>
    );
  }

  if (mode === "valence") {
    const ringRadius = 132;
    const valencePositions = getElectronPositions(valenceElectrons, ringRadius);

    return (
      <div className="atom-valence-scene">
        <svg viewBox="0 0 400 400" className="atom-model-svg" role="img" aria-label={`${atom.name} valence model`}>
          <circle className="atom-shell-ring atom-shell-ring-highlight" cx={sceneCenter} cy={sceneCenter} r={ringRadius} />

          {valencePositions.map((position, index) => (
            <circle
              key={`${atom.id}-valence-${index}`}
              className="atom-electron atom-electron-highlight"
              cx={position.x}
              cy={position.y}
              r={10}
            />
          ))}

          <circle className="atom-nucleus atom-nucleus-secondary" cx={sceneCenter} cy={sceneCenter} r={62} />
          <text x={sceneCenter} y={192} textAnchor="middle" className="atom-nucleus-symbol">
            {atom.symbol}
          </text>
          <text x={sceneCenter} y={222} textAnchor="middle" className="atom-nucleus-caption">
            {valenceElectrons} valence e-
          </text>
        </svg>

        <div className="atom-valence-meta">
          <article className="stat-card">
            <span>Outer shell</span>
            <strong>{shellLabels[shells.length - 1] ?? `n=${shells.length}`}</strong>
          </article>
          <article className="stat-card">
            <span>Valence electrons</span>
            <strong>{valenceElectrons}</strong>
          </article>
          <article className="stat-card">
            <span>Oxidation states</span>
            <strong>{atom.oxidationStates.join(", ")}</strong>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="atom-shell-scene">
      <svg viewBox="0 0 400 400" className="atom-model-svg" role="img" aria-label={`${atom.name} shell model`}>
        {shells.map((electronCount, shellIndex) => {
          const radius = getShellRadius(shellIndex);
          const positions = getElectronPositions(electronCount, radius);
          const shellStyle = {
            animationDuration: `${14 + shellIndex * 3}s`
          } as CSSProperties;

          return (
            <g
              key={`${atom.id}-shell-${shellIndex}`}
              className={shellIndex % 2 === 0 ? "atom-shell-group" : "atom-shell-group reverse"}
              style={shellStyle}
            >
              <circle className="atom-shell-ring" cx={sceneCenter} cy={sceneCenter} r={radius} />
              {positions.map((position, electronIndex) => (
                <circle
                  key={`${atom.id}-${shellIndex}-${electronIndex}`}
                  className="atom-electron"
                  cx={position.x}
                  cy={position.y}
                  r={6}
                />
              ))}
            </g>
          );
        })}

        <circle className="atom-nucleus" cx={sceneCenter} cy={sceneCenter} r={52} />
        <text x={sceneCenter} y={192} textAnchor="middle" className="atom-nucleus-symbol">
          {atom.symbol}
        </text>
        <text x={sceneCenter} y={220} textAnchor="middle" className="atom-nucleus-caption">
          {atom.atomicNumber} p+ / {neutronEstimate} n0
        </text>
      </svg>

      <div className="atom-shell-legend">
        {shells.map((electronCount, index) => (
          <div key={`${atom.id}-legend-${index}`} className="atom-shell-pill">
            <span>{shellLabels[index] ?? `n=${index + 1}`}</span>
            <strong>{electronCount} e-</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
