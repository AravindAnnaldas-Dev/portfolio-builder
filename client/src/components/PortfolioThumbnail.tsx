"use client";

import { Portfolio } from "@/types/portfolio";
import { renderPortfolioHtml } from "@/templates/render";

export function PortfolioThumbnail({ portfolio }: { portfolio: Portfolio }) {
  const html = renderPortfolioHtml(portfolio.template, portfolio.title, portfolio.content);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-white">
      <iframe
        title={`${portfolio.title} preview`}
        srcDoc={html}
        className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4]"
        tabIndex={-1}
      />
    </div>
  );
}
