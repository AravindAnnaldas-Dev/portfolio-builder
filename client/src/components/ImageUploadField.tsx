"use client";

import { useRef, useState } from "react";
import { uploadApi } from "@/lib/api";
import { Button } from "@/components/Button";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus("uploading");
    try {
      const { url } = await uploadApi.image(file);
      onChange(url);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              loading={status === "uploading"}
              onClick={() => inputRef.current?.click()}
            >
              {value ? "Replace image" : "Upload image"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          {status === "error" && <p className="text-xs text-red-500">Upload failed — try again.</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
