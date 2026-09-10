"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReview(formData: FormData) {
    const planId = (formData.get("planId") as string) || null;
    const improvement = (formData.get("improvement") as string)?.trim();
    const periodStart = formData.get("periodStart")
        ? new Date(formData.get("periodStart") as string)
        : null;
    const periodEnd = formData.get("periodEnd")
        ? new Date(formData.get("periodEnd") as string)
        : null;

    if (!improvement) {
        throw new Error("고칠 점을 입력해 주세요.");
    }

    await prisma.review.create({
        data: {
            planId: planId || null,
            improvement,
            periodStart,
            periodEnd,
        },
    });

    revalidatePath("/review");
}