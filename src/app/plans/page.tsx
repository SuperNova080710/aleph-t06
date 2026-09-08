import { prisma } from "@/lib/prisma";
import { createPlan } from "./actions";
import { Plan } from "@prisma/client";

type PlanWithCount = Plan & {
    _count: {
        todos: number;
    };
};

export default async function PlansPage() {
    const plans = await prisma.plan.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { todos: true },
            },
        },
    });

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">계획 (Plan)</h2>
                <p className="mt-1 text-zinc-600">
                    실제로 하고 있는 일을 계획으로 만들어 보세요.
                </p>
            </div>

            {/* 계획 생성 폼 */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">새 계획 만들기</h3>
                <form action={createPlan} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">제목 *</label>
                        <input
                            name="title"
                            required
                            placeholder="예: ALEPH T06 완성하기"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">설명</label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="이 계획에 대한 간단한 설명"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">시작일</label>
                            <input
                                type="date"
                                name="startDate"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">종료일</label>
                            <input
                                type="date"
                                name="endDate"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">우선순위 (1~5)</label>
                            <select
                                name="priority"
                                defaultValue="3"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            >
                                <option value="1">1 - 매우 높음</option>
                                <option value="2">2 - 높음</option>
                                <option value="3">3 - 보통</option>
                                <option value="4">4 - 낮음</option>
                                <option value="5">5 - 매우 낮음</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">예상 시간 (분)</label>
                            <input
                                type="number"
                                name="estimatedMinutes"
                                min="0"
                                placeholder="예: 120"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">성공 기준</label>
                            <input
                                name="successCriteria"
                                placeholder="예: 모든 카드 통과"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        계획 만들기
                    </button>
                </form>
            </section>

            {/* 계획 목록 */}
            <section className="space-y-4">
                <h3 className="font-semibold">내 계획 목록</h3>

                {plans.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-12 text-center text-zinc-500">
                        아직 계획이 없습니다. 위에서 첫 계획을 만들어 보세요.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {plans.map((plan: PlanWithCount) => (
                            <li
                                key={plan.id}
                                className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold">{plan.title}</h4>
                                        {plan.description && (
                                            <p className="mt-1 text-sm text-zinc-600">
                                                {plan.description}
                                            </p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                                우선순위 {plan.priority}
                                            </span>
                                            {plan.estimatedMinutes && (
                                                <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                                    예상 {plan.estimatedMinutes}분
                                                </span>
                                            )}
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                                할 일 {plan._count.todos}개
                                            </span>
                                            {plan.successCriteria && (
                                                <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                                    성공 기준: {plan.successCriteria}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={`/plans/${plan.id}`}
                                        className="shrink-0 text-sm text-zinc-600 hover:text-zinc-900"
                                    >
                                        자세히 →
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
