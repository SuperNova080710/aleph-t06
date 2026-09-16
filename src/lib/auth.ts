import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"

import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },

    secret: process.env.AUTH_SECRET,

    baseURL: process.env.AUTH_URL,
    
    trustedOrigins: ["http://localhost:3001"],
})