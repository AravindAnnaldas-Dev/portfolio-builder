import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer loads .env automatically for the CLI, so it's loaded
// explicitly above, and the datasource URL is read through env() below.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
