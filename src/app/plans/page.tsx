import { prisma } from "@/lib/prisma";
import { createPlan } from "./actions";

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
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                    실제로 하고 있는 일을 계획으로 만들어 보세요.
                </p>
            </div>

            <section className="card p-6">
                <h3 className="mb-4 font-semibold">새 계획 만들기</h3>
                <form action={createPlan} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">제목 *</label>
                        <input name="title" required placeholder="예: ALEPH T06 완성하기" className="input" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">설명</label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="이 계획에 대한 간단한 설명"
                            className="input"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">시작일</label>
                            <input type="date" name="startDate" className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">종료일</label>
                            <input type="date" name="endDate" className="input" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">우선순위 (1~5)</label>
                            <select name="priority" defaultValue="3" className="input">
                                <option value="1">1 - 매우 높음</option>
                                <option value="2">2 - 높음</option>
                                <option value="3">3 - 보통</option>
                                <option value="4">4 - 낮음</option>
                                <option value="5">5 - 매우 낮음</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">예상 시간 (분)</label>
                            <input type="number" name="estimatedMinutes" min="0" placeholder="예: 120" className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">성공 기준</label>
                            <input name="successCriteria" placeholder="예: 모든 카드 통과" className="input" />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">
                        계획 만들기
                    </button>
                </form>
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold">내 계획 목록</h3>

                {plans.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        아직 계획이 없습니다. 위에서 첫 계획을 만들어 보세요.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {plans.map((plan) => (
                            <li key={plan.id} className="card card-hover p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold">{plan.title}</h4>
                                        {plan.description && (
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                {plan.description}
                                            </p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="badge">우선순위 {plan.priority}</span>
                                            {plan.estimatedMinutes && (
                                                <span className="badge">예상 {plan.estimatedMinutes}분</span>
                                            )}
                                            <span className="badge">할 일 {plan._count.todos}개</span>
                                            {plan.successCriteria && (
                                                <span className="badge">성공 기준: {plan.successCriteria}</span>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={`/plans/${plan.id}`}
                                        className="shrink-0 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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