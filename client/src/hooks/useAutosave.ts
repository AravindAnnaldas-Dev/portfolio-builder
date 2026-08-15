import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

// Debounces calls to `save` so a burst of edits (e.g. someone typing a tagline)
// collapses into one request fired 1.2s after the user stops typing, rather than
// one request per keystroke. 1.2s is short enough that "autosave" still feels
// immediate, but long enough to coalesce an entire typing burst — protecting the
// API from being hit dozens of times a second and avoiding wasted writes for
// content that's about to change again anyway.
export function useAutosave<T>(value: T, save: (value: T) => Promise<unknown>, delayMs = 1200) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRun = useRef(true);
  const lastSerializedRef = useRef<string | null>(null);

  useEffect(() => {
    // `value` is a fresh object literal on every render, so its reference
    // always differs even when nothing actually changed. Comparing the
    // serialized content instead of the reference is what actually detects
    // an edit — without this, a render caused by anything else (e.g. the
    // query cache being updated after a save) would restart this effect,
    // save again, update the cache again, and loop indefinitely.
    const serialized = JSON.stringify(value);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await save(value);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return status;
}
