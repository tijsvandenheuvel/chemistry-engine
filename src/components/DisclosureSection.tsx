import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface DisclosureSectionProps {
  title: string;
  count?: number;
  preview?: string;
  defaultOpen?: boolean;
  emptyText?: string;
  children: ReactNode;
}

export function DisclosureSection({
  title,
  count,
  preview,
  defaultOpen = false,
  emptyText = "No items available.",
  children
}: DisclosureSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={open ? "disclosure-block open" : "disclosure-block"}>
      <button
        type="button"
        className="disclosure-toggle"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <div className="disclosure-copy">
          <h3>{title}</h3>
          {preview ? <p>{preview}</p> : null}
        </div>

        <div className="disclosure-meta">
          {typeof count === "number" ? <span className="count-chip">{count}</span> : null}
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {open ? (
        <div className="disclosure-content">
          {typeof count === "number" && count === 0 ? <div className="browser-empty">{emptyText}</div> : children}
        </div>
      ) : null}
    </article>
  );
}
