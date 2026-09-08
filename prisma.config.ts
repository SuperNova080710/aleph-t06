import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // generate 단계에서는 없어도 되도록 optional 처리
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
