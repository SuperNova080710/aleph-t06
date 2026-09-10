import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const [plans, todos, executionLogs, planVersions, reviews] =
        await Promise.all([
            prisma.plan.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.todo.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.executionLog.findMany({ orderBy: { createdAt: "asc" } }),
            prisma.planVersion.findMany({ orderBy: { changedAt: "asc" } }),
            prisma.review.findMany({ orderBy: { createdAt: "asc" } }),
        ]);

    const payload = {
        exportedAt: new Date().toISOString(),
        timezoneNote:
            "Dates are stored in the database as timestamps. Date-only fields use @db.Date. Delay calculation uses Asia/Seoul calendar day.",
        data: {
            plans,
            planVersions,
            todos,
            executionLogs,
            reviews,
        },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="plan-do-see-export-${Date.now()}.json"`,
            "Cache-Control": "no-store",
        },
    });
}