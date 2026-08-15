import { Router } from "express";
import archiver from "archiver";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { loadOwnedPortfolio } from "./portfolios";
import { renderTemplate } from "../templates";
import { PortfolioContentSchema, TemplateId } from "../types";

const router = Router();
router.use(requireAuth);

// Static-site export: same ownership check as every other single-resource
// route — an id alone is never enough to authorize access to the export.
router.get("/:id/export", async (req: AuthedRequest, res) => {
  const portfolio = await loadOwnedPortfolio(req.params.id, req.userId as string);
  if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });

  const content = PortfolioContentSchema.parse(portfolio.content);
  const html = renderTemplate(portfolio.template as TemplateId, portfolio.title, content);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${portfolio.slug}.zip"`);

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    // Headers are likely already sent once streaming starts; destroy the connection.
    res.destroy(err);
  });
  archive.pipe(res);

  // Everything the browser needs is in this one file — no build step, no server
  // calls, no API keys. That's what makes it truly portable to any static host.
  archive.append(html, { name: "index.html" });
  archive.append(
    "# Deploy\n\nDrag this folder onto Netlify/Vercel, or push it to a GitHub Pages branch. No build step required.\n",
    { name: "README.md" }
  );

  await archive.finalize();
});

export default router;
