"use client";

import { ForwardedRef, Ref, forwardRef, useEffect, useRef } from "react";
import { PortfolioContent, TemplateId } from "@/types/portfolio";
import { renderPortfolioBody, renderPortfolioHtml } from "@/templates/render";

interface Props {
  template: TemplateId;
  title: string;
  content: PortfolioContent;
}

// Shrinks the previewed site visually so more of the page fits in the pane —
// purely a display scale. The actual export renders full-size on the server
// from the same content, so this never affects what the user downloads.
const PREVIEW_SCALE = 0.6;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export const PreviewPane = forwardRef<HTMLIFrameElement, Props>(function PreviewPane(
  { template, title, content },
  forwardedRef: ForwardedRef<HTMLIFrameElement>
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Guards the DOM-patch effect below from racing the iframe's own initial
  // srcDoc parse (which is asynchronous) — only patch once that first load
  // has actually finished. Resets to false automatically on template switch
  // since `key={template}` remounts this component fresh.
  const hasLoadedRef = useRef(false);

  // Only the template determines the page shell/CSS, so it's the only thing
  // that needs a real reload (via `key`, below). Content/title edits patch
  // the already-loaded document directly instead of replacing srcDoc — that
  // avoids the full-page reload a srcDoc change forces, so updates are both
  // instant (no debounce needed) and flicker-free.
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !doc.body) return;
    if (doc.title !== title) doc.title = title;
    const body = renderPortfolioBody(template, content);
    if (doc.body.innerHTML !== body) doc.body.innerHTML = body;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <iframe
        key={template}
        ref={mergeRefs(iframeRef, forwardedRef)}
        title="Portfolio preview"
        srcDoc={renderPortfolioHtml(template, title, content)}
        onLoad={() => {
          hasLoadedRef.current = true;
        }}
        style={{
          width: `${100 / PREVIEW_SCALE}%`,
          height: `${100 / PREVIEW_SCALE}%`,
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: "top left",
          border: 0,
        }}
      />
    </div>
  );
});
