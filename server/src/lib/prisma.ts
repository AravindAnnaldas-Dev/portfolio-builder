import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 removed the built-in Rust query engine, so every database now
// connects through an explicit driver adapter — this is the Postgres one.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
