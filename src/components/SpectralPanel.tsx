import { useEffect, useMemo, useState } from "react";
import { Activity, AudioWaveform, Sparkles } from "lucide-react";
import type { MoleculeRecord, SpectrumProfile } from "../types/chemistry";

interface SpectralPanelProps {
  molecule: MoleculeRecord;
}

const chartWidth = 860;
const chartHeight = 280;
const padding = { top: 16, right: 28, bottom: 42, left: 28 };
const innerWidth = chartWidth - padding.left - padding.right;
const innerHeight = chartHeight - padding.top - padding.bottom;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatAxisValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function createXAxisTicks(profile: SpectrumProfile, count = 5) {
  const ticks = [];

  for (let index = 0; index < count; index += 1) {
    const ratio = index / (count - 1);
    const value = profile.xMin + (profile.xMax - profile.xMin) * ratio;
    ticks.push({
      value,
      x: padding.left + innerWidth * ratio
    });
  }

  return ticks;
}

function xToSvg(profile: SpectrumProfile, xValue: number) {
  const domainMin = Math.min(profile.xMin, profile.xMax);
  const domainMax = Math.max(profile.xMin, profile.xMax);
  const normalized = (xValue - domainMin) / (domainMax - domainMin || 1);
  const ratio = profile.reverseX ? 1 - normalized : normalized;
  return padding.left + ratio * innerWidth;
}

function yToSvg(value: number) {
  return padding.top + (1 - clamp(value, 0, 100) / 100) * innerHeight;
}

function createContinuousPath(profile: SpectrumProfile) {
  const sampleCount = 180;
  const domainMin = Math.min(profile.xMin, profile.xMax);
  const domainMax = Math.max(profile.xMin, profile.xMax);
  const path = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const ratio = index / (sampleCount - 1);
    const xValue = domainMin + (domainMax - domainMin) * ratio;
    const intensity = profile.peaks.reduce((sum, peak) => {
      const width = peak.width ?? (profile.kind === "1H NMR" ? 0.18 : 18);
      const contribution = peak.intensity * Math.exp(-0.5 * ((xValue - peak.position) / width) ** 2);
      return sum + contribution;
    }, 0);

    const chartX = xToSvg(profile, xValue);
    const chartY = yToSvg(Math.min(intensity, 100));
    path.push(`${index === 0 ? "M" : "L"} ${chartX.toFixed(2)} ${chartY.toFixed(2)}`);
  }

  return path.join(" ");
}

function SpectrumChart({ profile }: { profile: SpectrumProfile }) {
  const xTicks = useMemo(() => createXAxisTicks(profile), [profile]);
  const isMassStyle = profile.kind === "MS" || profile.kind === "MS/MS";
  const continuousPath = useMemo(() => (isMassStyle ? "" : createContinuousPath(profile)), [isMassStyle, profile]);

  return (
    <div className="spectral-chart">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${profile.title} chart`}>
        <defs>
          <linearGradient id={`spectrum-fill-${profile.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(137,240,218,0.42)" />
            <stop offset="100%" stopColor="rgba(137,240,218,0.02)" />
          </linearGradient>
        </defs>

        <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} rx="16" className="spectrum-grid-bg" />

        {Array.from({ length: 4 }, (_, index) => {
          const y = padding.top + (innerHeight / 3) * index;
          return <line key={index} x1={padding.left} x2={padding.left + innerWidth} y1={y} y2={y} className="spectrum-grid-line" />;
        })}

        {xTicks.map((tick) => (
          <g key={tick.x}>
            <line x1={tick.x} x2={tick.x} y1={padding.top} y2={padding.top + innerHeight} className="spectrum-grid-line vertical" />
            <text x={tick.x} y={chartHeight - 14} textAnchor="middle" className="spectrum-axis-text">
              {formatAxisValue(tick.value)}
            </text>
          </g>
        ))}

        {isMassStyle ? (
          profile.peaks.map((peak) => {
            const x = xToSvg(profile, peak.position);
            const y = yToSvg(peak.intensity);

            return (
              <g key={`${profile.id}-${peak.position}`}>
                <line x1={x} x2={x} y1={padding.top + innerHeight} y2={y} className="spectrum-stem" />
                <circle cx={x} cy={y} r="3" className="spectrum-dot" />
              </g>
            );
          })
        ) : (
          <>
            <path
              d={`${continuousPath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
              fill={`url(#spectrum-fill-${profile.id})`}
              opacity="0.8"
            />
            <path d={continuousPath} className="spectrum-path" />
            {profile.peaks.map((peak) => (
              <line
                key={`${profile.id}-${peak.position}`}
                x1={xToSvg(profile, peak.position)}
                x2={xToSvg(profile, peak.position)}
                y1={padding.top + innerHeight}
                y2={yToSvg(peak.intensity)}
                className="spectrum-guide"
              />
            ))}
          </>
        )}

        <text x={padding.left} y={14} className="spectrum-axis-text">
          {profile.yLabel}
        </text>
        <text x={chartWidth / 2} y={chartHeight - 4} textAnchor="middle" className="spectrum-axis-text">
          {profile.xLabel}
        </text>
      </svg>
    </div>
  );
}

export function SpectralPanel({ molecule }: SpectralPanelProps) {
  const [activeSpectrumId, setActiveSpectrumId] = useState(molecule.spectra[0]?.id ?? "");

  useEffect(() => {
    setActiveSpectrumId(molecule.spectra[0]?.id ?? "");
  }, [molecule.id, molecule.spectra]);

  const activeSpectrum = molecule.spectra.find((spectrum) => spectrum.id === activeSpectrumId) ?? molecule.spectra[0];

  if (!activeSpectrum) {
    return null;
  }

  return (
    <section className="panel spectral-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Spectral Diagrams</p>
          <h2>{molecule.name}</h2>
        </div>
        <div className="viewer-status">
          <AudioWaveform size={16} />
          <span>{molecule.spectra.length} spectral views</span>
        </div>
      </div>

      <div className="spectrum-tabs">
        {molecule.spectra.map((spectrum) => (
          <button
            key={spectrum.id}
            type="button"
            className={spectrum.id === activeSpectrum.id ? "chip active" : "chip"}
            onClick={() => setActiveSpectrumId(spectrum.id)}
          >
            {spectrum.kind}
          </button>
        ))}
      </div>

      <div className="spectral-summary-card">
        <div>
          <p className="spectral-kicker">
            <Sparkles size={14} />
            <span>{activeSpectrum.mode}</span>
          </p>
          <h3>{activeSpectrum.title}</h3>
          <p>{activeSpectrum.summary}</p>
        </div>
        <div className="spectral-stats">
          <div>
            <span>Peaks</span>
            <strong>{activeSpectrum.peaks.length}</strong>
          </div>
          <div>
            <span>Window</span>
            <strong>
              {formatAxisValue(activeSpectrum.xMin)} - {formatAxisValue(activeSpectrum.xMax)}
            </strong>
          </div>
        </div>
      </div>

      <SpectrumChart profile={activeSpectrum} />

      <div className="peak-strip">
        {activeSpectrum.peaks.slice(0, 8).map((peak) => (
          <div key={`${activeSpectrum.id}-${peak.position}`} className="peak-pill">
            <Activity size={14} />
            <span>{peak.label ?? activeSpectrum.kind}</span>
            <strong>{formatAxisValue(peak.position)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
