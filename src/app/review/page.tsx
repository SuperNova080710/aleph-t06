import { prisma } from "@/lib/prisma";
import { createReview } from "./actions";

type Props = {
    searchParams: Promise<{
        focus?: string;
        planId?: string;
    }>;
};

function startOfTodaySeoul() {
    const now = new Date();
    const seoul = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    seoul.setHours(0, 0, 0, 0);
    return seoul;
}

export default async function ReviewPage({ searchParams }: Props) {
    const sp = await searchParams;
    const focus = sp.focus || "all";

    const plans = await prisma.plan.findMany({
        include: {
            todos: {
                include: {
                    executionLogs: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const reviews = await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: { plan: true },
    });

    const today = startOfTodaySeoul();
    const allTodos = plans.flatMap((p) => p.todos);

    const planCount = allTodos.length;
    const completedTodos = allTodos.filter((t) => t.status === "COMPLETED");
    const completedCount = completedTodos.length;

    const delayedTodos = allTodos.filter((t) => {
        if (t.status === "COMPLETED") return false;
        if (!t.dueDate) return false;
        return t.dueDate < today;
    });
    const delayedCount = delayedTodos.length;

    const blockedTodos = allTodos.filter((t) =>
        t.executionLogs.some((log) => !!log.blockedReason)
    );
    const blockedCount = blockedTodos.length;

    const estimatedSum = allTodos.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const actualSum = allTodos.reduce(
        (sum, t) => sum + t.executionLogs.reduce((s, log) => s + (log.actualMinutes || 0), 0),
        0
    );
    const diff = actualSum - estimatedSum;

    let focusedTodos = allTodos;
    if (focus === "completed") focusedTodos = completedTodos;
    if (focus === "delayed") focusedTodos = delayedTodos;
    if (focus === "blocked") focusedTodos = blockedTodos;

    const focusLabel: Record<string, string> = {
        all: "전체 할 일",
        completed: "완료된 할 일",
        delayed: "지연된 할 일",
        blocked: "막힌 기록이 있는 할 일",
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">돌아보기 (See)</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                    숫자만 보지 말고, 숫자가 나온 기록까지 따라가 보세요.
                </p>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <a href="/review?focus=all" className="card card-hover p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">계획에 딸린 할 일 수</p>
                    <p className="mt-2 text-3xl font-bold">{planCount}</p>
                </a>
                <a href="/review?focus=completed" className="card card-hover p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">완료 수</p>
                    <p className="mt-2 text-3xl font-bold">{completedCount}</p>
                </a>
                <a href="/review?focus=delayed" className="card card-hover p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">지연 수</p>
                    <p className="mt-2 text-3xl font-bold">{delayedCount}</p>
                </a>
                <a href="/review?focus=blocked" className="card card-hover p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">막힘 수</p>
                    <p className="mt-2 text-3xl font-bold">{blockedCount}</p>
                </a>
                <div className="card p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">예상 시간 합계</p>
                    <p className="mt-2 text-3xl font-bold">{estimatedSum}분</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">실제 시간 합계 / 차이</p>
                    <p className="mt-2 text-3xl font-bold">
                        {actualSum}분{" "}
                        <span className="text-lg font-medium text-slate-500 dark:text-slate-400">
                            ({diff >= 0 ? "+" : ""}
                            {diff}분)
                        </span>
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">근거 기록 · {focusLabel[focus] || "전체 할 일"}</h3>
                    <a href="/review" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                        필터 초기화
                    </a>
                </div>

                {focusedTodos.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        해당하는 기록이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {focusedTodos.map((todo) => {
                            const parentPlan = plans.find((p) => p.id === todo.planId);
                            const todoActual = todo.executionLogs.reduce(
                                (s, log) => s + (log.actualMinutes || 0),
                                0
                            );
                            return (
                                <li key={todo.id} className="card p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{todo.title}</p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                계획: {parentPlan?.title || "-"} · 상태: {todo.status}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                예상 {todo.estimatedMinutes || 0}분 / 실제 {todoActual}분
                                            </p>
                                        </div>
                                        <a
                                            href={`/plans/${todo.planId}`}
                                            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                                        >
                                            계획으로 이동 →
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <section className="card p-6">
                <h3 className="mb-2 font-semibold">다음 계획으로 넘길 고칠 점</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    한 줄로 남겨 두세요. 나중에 새 계획을 만들 때 참고합니다.
                </p>

                <form action={createReview} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">관련 계획 (선택)</label>
                        <select name="planId" defaultValue="" className="input">
                            <option value="">전체 / 특정 계획 없음</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">기간 시작</label>
                            <input type="date" name="periodStart" className="input" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">기간 종료</label>
                            <input type="date" name="periodEnd" className="input" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">고칠 점 *</label>
                        <input
                            name="improvement"
                            required
                            placeholder="예: 예상 시간을 실제 기록 기준으로 다시 잡기"
                            className="input"
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        고칠 점 저장
                    </button>
                </form>
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold">저장된 고칠 점</h3>
                {reviews.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        아직 저장된 고칠 점이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {reviews.map((review) => (
                            <li key={review.id} className="card p-4 text-sm">
                                <p className="font-medium">{review.improvement}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {review.plan ? `관련 계획: ${review.plan.title} · ` : ""}
                                    {review.createdAt.toLocaleString("ko-KR")}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}