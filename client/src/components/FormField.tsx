"use client";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}

export function FormField({ label, value, onChange, textarea, placeholder }: Props) {
  const shared =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-accent";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={shared} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </div>
  );
}
