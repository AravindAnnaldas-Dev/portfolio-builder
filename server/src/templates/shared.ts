import { PortfolioContent } from "../types";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isVisible(content: PortfolioContent, key: string): boolean {
  return !content.hiddenSections.includes(key as any);
}

export function orderedSections(content: PortfolioContent): string[] {
  return content.sectionOrder.filter((key) => isVisible(content, key));
}

export function baseDocument(title: string, css: string, body: string, js = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body>
${body}
${js ? `<script>${js}</script>` : ""}
</body>
</html>`;
}
