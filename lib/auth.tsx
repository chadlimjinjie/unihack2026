import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
    plugins: [
        admin()
    ],
    //...other options
    emailAndPassword: {
        enabled: true,
    },
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
    allowedOrigins: [
        "*",
        "http://localhost:3000"
    ],
    trustedOrigins: [
        "*",
        "http://localhost:3000"
    ],
    database: new Pool({
        // connection options
        connectionString: process.env.DATABASE_URL,
    }),
})
