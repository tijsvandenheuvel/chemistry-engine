import { BadgeCheck, AlertTriangle, Clock3, FileQuestion, FlaskConical } from "lucide-react";
import type { VerificationReport, VerificationStatus } from "../types/chemistry";
import { DisclosureSection } from "./DisclosureSection";

interface VerificationSectionProps {
  report: VerificationReport;
  preview: string;
  defaultOpen?: boolean;
  loading?: boolean;
}

const statusMeta: Record<
  VerificationStatus,
  {
    label: string;
    className: string;
    icon: typeof BadgeCheck;
  }
> = {
  verified: {
    label: "verified",
    className: "verification-badge verified",
    icon: BadgeCheck
  },
  conflict: {
    label: "conflict",
    className: "verification-badge conflict",
    icon: AlertTriangle
  },
  "single-source": {
    label: "single-source",
    className: "verification-badge single-source",
    icon: FileQuestion
  },
  pending: {
    label: "pending",
    className: "verification-badge pending",
    icon: Clock3
  },
  modelled: {
    label: "modelled",
    className: "verification-badge modelled",
    icon: FlaskConical
  }
};

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span className={meta.className}>
      <Icon size={14} />
      <span>{meta.label}</span>
    </span>
  );
}

export function VerificationSection({
  report,
  preview,
  defaultOpen = false,
  loading = false
}: VerificationSectionProps) {
  const conflictFields = report.fields.filter((field) => field.status === "conflict");

  return (
    <DisclosureSection
      title="Verification & provenance"
      count={report.fields.length}
      preview={preview}
      defaultOpen={defaultOpen}
    >
      <div className="verification-sheet">
        <div className="verification-toolbar">
          <div className="tag-row">
            <VerificationBadge status={report.overallStatus} />
            {loading ? <span className="availability availability-neutral">checking sources</span> : null}
          </div>

          <div className="verification-counts">
            {report.counts.verified > 0 ? <span className="count-chip">{report.counts.verified} verified</span> : null}
            {report.counts.conflict > 0 ? <span className="count-chip">{report.counts.conflict} conflict</span> : null}
            {report.counts.singleSource > 0 ? <span className="count-chip">{report.counts.singleSource} single-source</span> : null}
            {report.counts.pending > 0 ? <span className="count-chip">{report.counts.pending} pending</span> : null}
            {report.counts.modelled > 0 ? <span className="count-chip">{report.counts.modelled} modelled</span> : null}
          </div>
        </div>

        <article className="subpanel verification-summary-panel">
          <div className="subpanel-head">
            <h3>Verification overview</h3>
            <VerificationBadge status={report.overallStatus} />
          </div>
          <p className="detail-intro compact-intro">{report.summary}</p>
          {report.notes.length > 0 ? (
            <ul className="plain-list">
              {report.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="subpanel">
          <div className="subpanel-head">
            <h3>Source graph</h3>
            <span className="count-chip">{report.sources.length}</span>
          </div>
          <div className="verification-source-grid">
            {report.sources.map((source) =>
              source.url ? (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="verification-source-card"
                >
                  <div>
                    <strong>{source.label}</strong>
                    <p>{source.detail}</p>
                  </div>
                  <span className={`verification-source-state ${source.state}`}>{source.state}</span>
                </a>
              ) : (
                <div key={source.id} className="verification-source-card">
                  <div>
                    <strong>{source.label}</strong>
                    <p>{source.detail}</p>
                  </div>
                  <span className={`verification-source-state ${source.state}`}>{source.state}</span>
                </div>
              )
            )}
          </div>
        </article>

        {conflictFields.length > 0 ? (
          <article className="subpanel verification-conflict-panel">
            <div className="subpanel-head">
              <h3>Detected disagreements</h3>
              <span className="count-chip">{conflictFields.length}</span>
            </div>

            <div className="verification-field-list">
              {conflictFields.map((field) => (
                <div key={field.id} className="verification-field-card conflict">
                  <div className="verification-field-head">
                    <div>
                      <strong>{field.label}</strong>
                      <p>{field.note ?? "Source values do not currently align."}</p>
                    </div>
                    <VerificationBadge status={field.status} />
                  </div>

                  <div className="verification-observation-list">
                    {field.observations.map((observation) => (
                      <div key={`${field.id}-${observation.sourceId}-${observation.value}`} className="verification-observation">
                        <span>{observation.sourceLabel}</span>
                        <strong>{observation.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        <article className="subpanel">
          <div className="subpanel-head">
            <h3>Field checks</h3>
            <span className="count-chip">{report.fields.length}</span>
          </div>

          <div className="verification-field-list">
            {report.fields.map((field) => (
              <div key={field.id} className={`verification-field-card ${field.status.replace(/[^a-z]/g, "-")}`}>
                <div className="verification-field-head">
                  <div>
                    <strong>{field.label}</strong>
                    <p>{field.note ?? `Canonical value: ${field.canonicalValue}`}</p>
                  </div>
                  <VerificationBadge status={field.status} />
                </div>

                <div className="verification-observation-list">
                  {field.observations.map((observation) => (
                    <div key={`${field.id}-${observation.sourceId}-${observation.value}`} className="verification-observation">
                      <span>{observation.sourceLabel}</span>
                      <strong>{observation.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </DisclosureSection>
  );
}
