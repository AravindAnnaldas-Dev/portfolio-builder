import { Router } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { PortfolioCreateSchema, PortfolioUpdateSchema } from "../types";

const router = Router();
router.use(requireAuth);

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

// Retries slug generation on the rare unique-constraint collision instead of
// letting it fall through to a generic 500.
async function createPortfolioWithUniqueSlug(
  title: string,
  data: { userId: string; title: string; template: string; content: any }
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.portfolio.create({ data: { ...data, slug: slugify(title) } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && attempt < 4) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed to generate a unique slug");
}

// List: scoped to the caller's own portfolios via the WHERE clause, not filtered after the fact.
router.get("/", async (req: AuthedRequest, res) => {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: "desc" },
  });
  res.json(portfolios);
});

router.post("/", async (req: AuthedRequest, res) => {
  const parsed = PortfolioCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { title, template, content } = parsed.data;

  const portfolio = await createPortfolioWithUniqueSlug(title, {
    userId: req.userId as string,
    title,
    template,
    content,
  });
  res.status(201).json(portfolio);
});

// Ownership check helper: every single-resource route (get/update/delete/export)
// must confirm portfolio.userId === req.userId before doing anything else.
// Skipping this is an IDOR (Insecure Direct Object Reference) — without it, any
// authenticated user could pass another user's portfolio id and read/edit/delete it,
// since ids are just opaque strings with no per-user secrecy of their own.
async function loadOwnedPortfolio(id: string, userId: string) {
  const portfolio = await prisma.portfolio.findUnique({ where: { id } });
  if (!portfolio || portfolio.userId !== userId) {
    return null;
  }
  return portfolio;
}

router.get("/:id", async (req: AuthedRequest, res) => {
  const portfolio = await loadOwnedPortfolio(req.params.id, req.userId as string);
  if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });
  res.json(portfolio);
});

router.put("/:id", async (req: AuthedRequest, res) => {
  const existing = await loadOwnedPortfolio(req.params.id, req.userId as string);
  if (!existing) return res.status(404).json({ error: "Portfolio not found" });

  const parsed = PortfolioUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = await prisma.portfolio.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json(updated);
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await loadOwnedPortfolio(req.params.id, req.userId as string);
  if (!existing) return res.status(404).json({ error: "Portfolio not found" });

  await prisma.portfolio.delete({ where: { id: existing.id } });
  res.status(204).send();
});

// Duplicate: copies content/template into a brand new row owned by the same user.
router.post("/:id/duplicate", async (req: AuthedRequest, res) => {
  const existing = await loadOwnedPortfolio(req.params.id, req.userId as string);
  if (!existing) return res.status(404).json({ error: "Portfolio not found" });

  const copy = await createPortfolioWithUniqueSlug(existing.title, {
    userId: existing.userId,
    title: `${existing.title} (copy)`,
    template: existing.template,
    content: existing.content as any,
  });
  res.status(201).json(copy);
});

export default router;
export { loadOwnedPortfolio };
