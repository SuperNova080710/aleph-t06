"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const priority = Number(formData.get("priority") || 3);
    const successCriteria = formData.get("successCriteria") as string | null;
    const estimatedMinutes = formData.get("estimatedMinutes")
        ? Number(formData.get("estimatedMinutes"))
        : null;
    const startDate = formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : null;
    const endDate = formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : null;

    if (!title || title.trim().length === 0) {
        throw new Error("제목은 필수입니다.");
    }

    await prisma.plan.create({
        data: {
            title: title.trim(),
            description: description?.trim() || null,
            priority,
            successCriteria: successCriteria?.trim() || null,
            estimatedMinutes,
            startDate,
            endDate,
        },
    });

    revalidatePath("/plans");
}