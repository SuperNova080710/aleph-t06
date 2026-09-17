"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";

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

    const user = await requireUser();

    if (planId) {
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId: user.id,
            },
        });

        if (!plan) {
            throw new Error("계획을 찾을 수 없습니다.");
        }
    }

    await prisma.review.create({
        data: {
            userId: user.id,
            planId,
            improvement,
            periodStart,
            periodEnd,
        },
    });

    revalidatePath("/review");
}