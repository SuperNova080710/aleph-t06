"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 
import { redirect } from "next/navigation";

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

export async function updatePlan(formData: FormData) {
    const id = formData.get("id") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const priority = Number(formData.get("priority") || 3);
    const successCriteria =
        (formData.get("successCriteria") as string)?.trim() || null;
    const estimatedMinutes = formData.get("estimatedMinutes")
        ? Number(formData.get("estimatedMinutes"))
        : null;
    const startDate = formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : null;
    const endDate = formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : null;
    const changeNote = (formData.get("changeNote") as string)?.trim() || null;

    if (!id || !title) {
        throw new Error("필수 값이 없습니다.");
    }

    const current = await prisma.plan.findUnique({ where: { id } });
    if (!current) {
        throw new Error("계획을 찾을 수 없습니다.");
    }

    // 1) 수정 전 내용을 PlanVersion에 저장
    await prisma.planVersion.create({
        data: {
            planId: current.id,
            title: current.title,
            description: current.description,
            startDate: current.startDate,
            endDate: current.endDate,
            priority: current.priority,
            successCriteria: current.successCriteria,
            estimatedMinutes: current.estimatedMinutes,
            changeNote,
        },
    });

    // 2) Plan 업데이트
    await prisma.plan.update({
        where: { id },
        data: {
            title,
            description,
            priority,
            successCriteria,
            estimatedMinutes,
            startDate,
            endDate,
        },
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${id}`);
    redirect(`/plans/${id}`);
}