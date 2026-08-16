"use client";

import { useEffect, useRef, useState } from "react";
import { TEMPLATES, TemplateId } from "@/types/portfolio";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const LABELS: Record<TemplateId, string> = {
  "minimal-dev": "Minimal Dev",
  "creative-grid": "Creative Grid",
  "single-page-scroll": "Single Page Scroll",
  "sidebar-profile": "Sidebar Profile",
};

export function TemplateSwitcher({ value, onChange }: { value: TemplateId; onChange: (t: TemplateId) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-1 sm:block">
      <button
        type="button"
        aria-label="Scroll templates left"
        onClick={() => scrollBy(-140)}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted transition-opacity hover:text-text sm:hidden ${
          canScrollLeft ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
      </button>

      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className="scrollbar-none flex flex-1 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
      >
        {TEMPLATES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              value === t
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-text hover:bg-border/40"
            }`}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll templates right"
        onClick={() => scrollBy(140)}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted transition-opacity hover:text-text sm:hidden ${
          canScrollRight ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
