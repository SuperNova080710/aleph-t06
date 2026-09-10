import { prisma } from "@/lib/prisma";
import { createReview } from "./actions";

type Props = {
    searchParams: Promise<{
        focus?: string; // completed | delayed | blocked | all
        planId?: string;
    }>;
};

function startOfTodaySeoul() {
    // 서버가 UTC여도 서울 날짜 기준으로 비교하기 위한 간단 처리
    const now = new Date();
    const seoul = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    seoul.setHours(0, 0, 0, 0);
    return seoul;
}

export default async function ReviewPage({ searchParams }: Props) {
    const sp = await searchParams;
    const focus = sp.focus || "all";
    const selectedPlanId = sp.planId || "";

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

    // 전체 집계
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

    const estimatedSum = allTodos.reduce(
        (sum, t) => sum + (t.estimatedMinutes || 0),
        0
    );
    const actualSum = allTodos.reduce(
        (sum, t) =>
            sum +
            t.executionLogs.reduce(
                (s, log) => s + (log.actualMinutes || 0),
                0
            ),
        0
    );
    const diff = actualSum - estimatedSum;

    // 드릴다운 대상
    let focusedTodos = allTodos;
    if (focus === "completed") focusedTodos = completedTodos;
    if (focus === "delayed") focusedTodos = delayedTodos;
    if (focus === "blocked") focusedTodos = blockedTodos;
    if (selectedPlanId) {
        focusedTodos = focusedTodos.filter((t) => t.planId === selectedPlanId);
    }

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
                <p className="mt-1 text-zinc-600">
                    숫자만 보지 말고, 숫자가 나온 기록까지 따라가 보세요.
                </p>
            </div>

            {/* 집계 카드 */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <a
                    href="/review?focus=all"
                    className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
                >
                    <p className="text-sm text-zinc-500">계획에 딸린 할 일 수</p>
                    <p className="mt-2 text-3xl font-bold">{planCount}</p>
                </a>

                <a
                    href="/review?focus=completed"
                    className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
                >
                    <p className="text-sm text-zinc-500">완료 수</p>
                    <p className="mt-2 text-3xl font-bold">{completedCount}</p>
                </a>

                <a
                    href="/review?focus=delayed"
                    className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
                >
                    <p className="text-sm text-zinc-500">지연 수 (서울 기준 오늘 이전 마감, 미완료)</p>
                    <p className="mt-2 text-3xl font-bold">{delayedCount}</p>
                </a>

                <a
                    href="/review?focus=blocked"
                    className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
                >
                    <p className="text-sm text-zinc-500">막힘 수 (막힌 이유 1개 이상)</p>
                    <p className="mt-2 text-3xl font-bold">{blockedCount}</p>
                </a>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-zinc-500">예상 시간 합계</p>
                    <p className="mt-2 text-3xl font-bold">{estimatedSum}분</p>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-zinc-500">실제 시간 합계 / 차이</p>
                    <p className="mt-2 text-3xl font-bold">
                        {actualSum}분{" "}
                        <span className="text-lg font-medium text-zinc-500">
                            ({diff >= 0 ? "+" : ""}
                            {diff}분)
                        </span>
                    </p>
                </div>
            </section>

            {/* 드릴다운 목록 */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">
                        근거 기록 · {focusLabel[focus] || "전체 할 일"}
                    </h3>
                    <a href="/review" className="text-sm text-zinc-500 hover:text-zinc-800">
                        필터 초기화
                    </a>
                </div>

                {focusedTodos.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-10 text-center text-sm text-zinc-500">
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
                                <li
                                    key={todo.id}
                                    className="rounded-xl border bg-white p-4 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">{todo.title}</p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                계획: {parentPlan?.title || "-"} · 상태: {todo.status}
                                                {todo.dueDate &&
                                                    ` · 마감 ${todo.dueDate.toISOString().slice(0, 10)}`}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                예상 {todo.estimatedMinutes || 0}분 / 실제 {todoActual}분
                                            </p>
                                            {todo.executionLogs.some((l) => l.blockedReason) && (
                                                <p className="mt-1 text-xs text-amber-700">
                                                    막힘:{" "}
                                                    {todo.executionLogs
                                                        .filter((l) => l.blockedReason)
                                                        .map((l) => l.blockedReason)
                                                        .join(" / ")}
                                                </p>
                                            )}
                                        </div>
                                        <a
                                            href={`/plans/${todo.planId}`}
                                            className="text-sm text-zinc-600 hover:text-zinc-900"
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

            {/* 고칠 점 저장 */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold">다음 계획으로 넘길 고칠 점</h3>
                <p className="mb-4 text-sm text-zinc-500">
                    한 줄로 남겨 두세요. 나중에 새 계획을 만들 때 참고합니다.
                </p>

                <form action={createReview} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">관련 계획 (선택)</label>
                        <select
                            name="planId"
                            defaultValue=""
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        >
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
                            <input
                                type="date"
                                name="periodStart"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">기간 종료</label>
                            <input
                                type="date"
                                name="periodEnd"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">고칠 점 *</label>
                        <input
                            name="improvement"
                            required
                            placeholder="예: 예상 시간을 실제 기록 기준으로 다시 잡기"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        고칠 점 저장
                    </button>
                </form>
            </section>

            {/* 저장된 고칠 점 목록 */}
            <section className="space-y-4">
                <h3 className="font-semibold">저장된 고칠 점</h3>
                {reviews.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-zinc-500">
                        아직 저장된 고칠 점이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {reviews.map((review) => (
                            <li
                                key={review.id}
                                className="rounded-xl border bg-white p-4 text-sm shadow-sm"
                            >
                                <p className="font-medium">{review.improvement}</p>
                                <p className="mt-1 text-xs text-zinc-500">
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