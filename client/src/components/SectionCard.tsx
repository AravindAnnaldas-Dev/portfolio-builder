"use client";

import { ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

interface Props {
  title: string;
  hidden: boolean;
  onToggleHidden: () => void;
  dragHandle: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, hidden, onToggleHidden, dragHandle, children }: Props) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-5 ${hidden ? "opacity-60" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandle}
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
        <button
          aria-label={hidden ? `Show ${title}` : `Hide ${title}`}
          onClick={onToggleHidden}
          className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-border/40"
        >
          {hidden ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
      {children}
    </div>
  );
}
