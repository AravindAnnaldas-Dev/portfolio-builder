"use client";

import { TEMPLATES, TemplateId } from "@/types/portfolio";

const LABELS: Record<TemplateId, string> = {
  "minimal-dev": "Minimal Dev",
  "creative-grid": "Creative Grid",
  "single-page-scroll": "Single Page Scroll",
  "sidebar-profile": "Sidebar Profile",
};

export function TemplateSwitcher({ value, onChange }: { value: TemplateId; onChange: (t: TemplateId) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            value === t
              ? "border-accent bg-accent text-white"
              : "border-border bg-surface text-text hover:bg-border/40"
          }`}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  );
}
