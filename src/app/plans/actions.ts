"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 
import { redirect } from "next/navigation"; 
import { TodoStatus } from "@prisma/client";

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

export async function createTodo(formData: FormData) {
    const planId = formData.get("planId") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const priority = Number(formData.get("priority") || 3);
    const dueDate = formData.get("dueDate")
        ? new Date(formData.get("dueDate") as string)
        : null;
    const estimatedMinutes = formData.get("estimatedMinutes")
        ? Number(formData.get("estimatedMinutes"))
        : null;
    const tagsRaw = (formData.get("tags") as string)?.trim() || "";
    const tags = tagsRaw
        ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    if (!planId || !title) {
        throw new Error("필수 값이 없습니다.");
    }

    await prisma.todo.create({
        data: {
            planId,
            title,
            description,
            priority,
            dueDate,
            estimatedMinutes,
            tags,
        },
    });

    revalidatePath(`/plans/${planId}`);
}

export async function updateTodoStatus(formData: FormData) {
    const id = formData.get("id") as string;
    const planId = formData.get("planId") as string;
    const status = formData.get("status") as TodoStatus;

    if (!id || !planId || !status) {
        throw new Error("필수 값이 없습니다.");
    }

    await prisma.todo.update({
        where: { id },
        data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
        },
    });

    revalidatePath(`/plans/${planId}`);
}

export async function deleteTodo(formData: FormData) {
    const id = formData.get("id") as string;
    const planId = formData.get("planId") as string;

    if (!id || !planId) {
        throw new Error("필수 값이 없습니다.");
    }

    await prisma.todo.delete({ where: { id } });
    revalidatePath(`/plans/${planId}`);
}

export async function createExecutionLog(formData: FormData) {
    const todoId = formData.get("todoId") as string;
    const planId = formData.get("planId") as string;
    const startedAtRaw = formData.get("startedAt") as string;
    const endedAtRaw = formData.get("endedAt") as string | null;
    const actualMinutes = formData.get("actualMinutes")
        ? Number(formData.get("actualMinutes"))
        : null;
    const blockedReason =
        (formData.get("blockedReason") as string)?.trim() || null;
    const note = (formData.get("note") as string)?.trim() || null;

    if (!todoId || !planId || !startedAtRaw) {
        throw new Error("필수 값이 없습니다.");
    }

    const startedAt = new Date(startedAtRaw);
    const endedAt = endedAtRaw ? new Date(endedAtRaw) : null;

    // 실행 기록만 추가 (Todo/Plan 값은 절대 덮어쓰지 않음)
    await prisma.executionLog.create({
        data: {
            todoId,
            startedAt,
            endedAt,
            actualMinutes,
            blockedReason,
            note,
        },
    });

    revalidatePath(`/plans/${planId}`);
}

export async function getExecutionLogs(todoId: string) {
  if (!todoId) return [];

  return prisma.executionLog.findMany({
    where: { todoId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}