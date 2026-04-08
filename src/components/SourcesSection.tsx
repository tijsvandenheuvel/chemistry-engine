import type { SourceEntry } from "../lib/sources";
import { DisclosureSection } from "./DisclosureSection";

interface SourcesSectionProps {
  entries: SourceEntry[];
  preview: string;
}

export function SourcesSection({ entries, preview }: SourcesSectionProps) {
  return (
    <DisclosureSection
      title="Sources & references"
      count={entries.length}
      preview={preview}
      emptyText="No source links are attached yet."
    >
      <div className="reference-list">
        {entries.map((entry) => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="reference-card"
          >
            <div>
              <span className="reference-kind">{entry.kind}</span>
              <strong>{entry.label}</strong>
              <p>{entry.detail}</p>
            </div>
            <span className="availability availability-neutral">{entry.badge}</span>
          </a>
        ))}
      </div>
    </DisclosureSection>
  );
}
