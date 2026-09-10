import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PlansLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const plans = await prisma.plan.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { todos: true } },
        },
    });

    return (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* 왼쪽 네비게이션 */}
            <aside className="card h-fit p-4 lg:sticky lg:top-24">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        계획 목록
                    </h2>
                    <Link
                        href="/plans"
                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        새로 만들기
                    </Link>
                </div>

                {plans.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        아직 계획이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {plans.map((plan) => (
                            <li key={plan.id}>
                                <Link
                                    href={`/plans/${plan.id}`}
                                    className="block rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                                    style={{ viewTransitionName: `plan-card-${plan.id}` }}
                                >
                                    <p
                                        className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100"
                                        style={{ viewTransitionName: `plan-title-${plan.id}` }}
                                    >
                                        {plan.title}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        할 일 {plan._count.todos}개 · 우선순위 {plan.priority}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>

            {/* 가운데 상세 영역 */}
            <section className="min-w-0">{children}</section>
        </div>
    );
}