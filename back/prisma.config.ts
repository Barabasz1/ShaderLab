// prisma.config.ts
export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env["DATABASE_URL"] ??
      "postgresql://admin:password123@localhost:5432/nestjs_db?schema=public",
  },
};