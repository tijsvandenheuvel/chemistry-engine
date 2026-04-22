import type { SourceEntry } from "../lib/sources";
import { getSafeExternalHref } from "../lib/urls";
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
        {entries.map((entry) => {
          const safeHref = getSafeExternalHref(entry.url);

          if (!safeHref) {
            return (
              <div key={entry.id} className="reference-card" aria-disabled="true">
                <div>
                  <span className="reference-kind">{entry.kind}</span>
                  <strong>{entry.label}</strong>
                  <p>{entry.detail}</p>
                </div>
                <span className="availability availability-neutral">blocked</span>
              </div>
            );
          }

          return (
            <a
              key={entry.id}
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer external"
              referrerPolicy="no-referrer"
              className="reference-card"
            >
              <div>
                <span className="reference-kind">{entry.kind}</span>
                <strong>{entry.label}</strong>
                <p>{entry.detail}</p>
              </div>
              <span className="availability availability-neutral">{entry.badge}</span>
            </a>
          );
        })}
      </div>
    </DisclosureSection>
  );
}
