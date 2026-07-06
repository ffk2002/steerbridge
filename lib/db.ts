import { PrismaClient } from "@prisma/client";
import path from "path";

function getDatabaseUrl() {
    const envUrl = process.env.DATABASE_URL;

    // Use absolute path for prisma/dev.db as the primary fallback and standard.
    // This ensures consistency between Prisma CLI (which looks relative to schema)
    // and Next.js (which looks relative to project root).
    const defaultUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

    if (!envUrl || envUrl === "file:./dev.db" || envUrl === "file:dev.db") {
        return defaultUrl;
    }

    // Otherwise, use the provided environment variable
    return envUrl;
}

const DB_URL = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    return new PrismaClient({
        datasources: {
            db: {
                url: DB_URL,
            },
        },
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
