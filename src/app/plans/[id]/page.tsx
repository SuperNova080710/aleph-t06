import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    updatePlan,
    createTodo,
    updateTodoStatus,
    deleteTodo,
    createExecutionLog,
} from "../actions";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        q?: string;
        status?: string;
        sort?: string;
    }>;
};

export default async function PlanDetailPage({ params, searchParams }: Props) {
    const { id } = await params;
    const sp = await searchParams;

    const q = (sp.q || "").trim();
    const statusFilter = sp.status || "ALL";
    const sort = sp.sort || "priority";

    const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
            versions: {
                orderBy: { changedAt: "desc" },
            },
            todos: {
                include: {
                    executionLogs: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
            _count: {
                select: { todos: true },
            },
        },
    });

    if (!plan) notFound();

    // 검색
    let todos = plan.todos.filter((todo) => {
        if (!q) return true;
        const target = `${todo.title} ${todo.description || ""} ${todo.tags.join(" ")}`.toLowerCase();
        return target.includes(q.toLowerCase());
    });

    // 상태 필터
    if (statusFilter !== "ALL") {
        todos = todos.filter((todo) => todo.status === statusFilter);
    }

    // 정렬 (기준을 화면에 명시)
    todos = [...todos].sort((a, b) => {
        if (sort === "dueDate") {
            const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            if (ad !== bd) return ad - bd;
            return a.priority - b.priority;
        }
        if (sort === "createdAt") {
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
        // default: priority
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toISOString().slice(0, 10);
    };

    const formatDateTimeLocal = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 16);
    };

    const statusLabel: Record<string, string> = {
        PENDING: "대기",
        IN_PROGRESS: "진행 중",
        COMPLETED: "완료",
        CANCELLED: "취소",
    };

    const nowLocal = formatDateTimeLocal(new Date());

    return (
        <div className="space-y-10">
            <div>
                <a href="/plans" className="text-sm text-slate-500 dark:text-slate-400 hover:text-zinc-800">
                    ← 계획 목록
                </a>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{plan.title}</h2>
                {plan.description && (
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{plan.description}</p>
                )}
            </div>

            {/* 현재 계획 정보 */}
            <section className="card p-6">
                <h3 className="mb-4 font-semibold">현재 계획</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">우선순위</dt>
                        <dd className="font-medium">{plan.priority}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">예상 시간</dt>
                        <dd className="font-medium">
                            {plan.estimatedMinutes ? `${plan.estimatedMinutes}분` : "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">기간</dt>
                        <dd className="font-medium">
                            {formatDate(plan.startDate) || "-"} ~ {formatDate(plan.endDate) || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500 dark:text-slate-400">할 일 수</dt>
                        <dd className="font-medium">{plan._count.todos}개</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-slate-500 dark:text-slate-400">성공 기준</dt>
                        <dd className="font-medium">{plan.successCriteria || "-"}</dd>
                    </div>
                </dl>
            </section>

            {/* 할 일 섹션 */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h3 className="font-semibold">할 일 (Todo)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        정렬 기준:{" "}
                        {sort === "dueDate"
                            ? "마감일 → 우선순위"
                            : sort === "createdAt"
                                ? "최신 생성순"
                                : "우선순위 → 최신 생성순"}
                    </p>
                </div>

                {/* 검색 / 필터 / 정렬 */}
                <form className="grid gap-3 card p-4 sm:grid-cols-4">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="제목, 설명, 태그 검색"
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400 sm:col-span-2"
                    />
                    <select
                        name="status"
                        defaultValue={statusFilter}
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    >
                        <option value="ALL">전체 상태</option>
                        <option value="PENDING">대기</option>
                        <option value="IN_PROGRESS">진행 중</option>
                        <option value="COMPLETED">완료</option>
                        <option value="CANCELLED">취소</option>
                    </select>
                    <select
                        name="sort"
                        defaultValue={sort}
                        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    >
                        <option value="priority">우선순위순</option>
                        <option value="dueDate">마감일순</option>
                        <option value="createdAt">최신순</option>
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:col-span-4 sm:w-fit"
                    >
                        적용
                    </button>
                </form>

                {/* 할 일 추가 */}
                <div className="card p-6">
                    <h4 className="mb-4 text-sm font-semibold">할 일 추가</h4>
                    <form action={createTodo} className="space-y-3">
                        <input type="hidden" name="planId" value={plan.id} />
                        <div>
                            <label className="mb-1 block text-sm font-medium">제목 *</label>
                            <input
                                name="title"
                                required
                                placeholder="예: Prisma 스키마 작성"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">설명</label>
                            <input
                                name="description"
                                placeholder="간단한 설명"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">우선순위</label>
                                <select
                                    name="priority"
                                    defaultValue="3"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">마감일</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">예상 시간(분)</label>
                                <input
                                    type="number"
                                    name="estimatedMinutes"
                                    min="0"
                                    placeholder="30"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">태그 (쉼표 구분)</label>
                                <input
                                    name="tags"
                                    placeholder="backend, urgent"
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                        >
                            할 일 추가
                        </button>
                    </form>
                </div>

                {/* 할 일 목록 + 실행 기록 */}
                {todos.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        조건에 맞는 할 일이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {todos.map((todo) => (
                            <li key={todo.id} className="card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">{todo.title}</span>
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">
                                                {statusLabel[todo.status] ?? todo.status}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                우선순위 {todo.priority}
                                            </span>
                                        </div>
                                        {todo.description && (
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{todo.description}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            {todo.dueDate && <span>마감 {formatDate(todo.dueDate)}</span>}
                                            {todo.estimatedMinutes && (
                                                <span>예상 {todo.estimatedMinutes}분</span>
                                            )}
                                            {todo.tags?.map((tag) => (
                                                <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {todo.status !== "IN_PROGRESS" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="IN_PROGRESS" />
                                                <button type="submit" className="rounded-lg border px-2.5 py-1 text-xs hover:bg-slate-50 dark:bg-slate-900/50">
                                                    진행
                                                </button>
                                            </form>
                                        )}
                                        {todo.status !== "COMPLETED" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="COMPLETED" />
                                                <button type="submit" className="rounded-lg border px-2.5 py-1 text-xs hover:bg-slate-50 dark:bg-slate-900/50">
                                                    완료
                                                </button>
                                            </form>
                                        )}
                                        {todo.status === "COMPLETED" && (
                                            <form action={updateTodoStatus}>
                                                <input type="hidden" name="id" value={todo.id} />
                                                <input type="hidden" name="planId" value={plan.id} />
                                                <input type="hidden" name="status" value="PENDING" />
                                                <button type="submit" className="rounded-lg border px-2.5 py-1 text-xs hover:bg-slate-50 dark:bg-slate-900/50">
                                                    되돌리기
                                                </button>
                                            </form>
                                        )}
                                        <form action={deleteTodo}>
                                            <input type="hidden" name="id" value={todo.id} />
                                            <input type="hidden" name="planId" value={plan.id} />
                                            <button
                                                type="submit"
                                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                                            >
                                                삭제
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* 실행 기록 추가 */}
                                <details className="mt-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-3">
                                    <summary className="cursor-pointer text-sm font-medium">
                                        실행 기록 남기기 / 보기 ({todo.executionLogs.length})
                                    </summary>

                                    <form action={createExecutionLog} className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <input type="hidden" name="todoId" value={todo.id} />
                                        <input type="hidden" name="planId" value={plan.id} />
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">시작 시각 *</label>
                                            <input
                                                type="datetime-local"
                                                name="startedAt"
                                                required
                                                defaultValue={nowLocal}
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">종료 시각</label>
                                            <input
                                                type="datetime-local"
                                                name="endedAt"
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">실제 소요(분)</label>
                                            <input
                                                type="number"
                                                name="actualMinutes"
                                                min="0"
                                                placeholder="45"
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">막힌 이유</label>
                                            <input
                                                name="blockedReason"
                                                placeholder="예: 환경변수 설정 오류"
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-xs font-medium">메모</label>
                                            <input
                                                name="note"
                                                placeholder="선택 메모"
                                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 sm:col-span-2 sm:w-fit"
                                        >
                                            실행 기록 저장
                                        </button>
                                    </form>

                                    {todo.executionLogs.length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                            {todo.executionLogs.map((log) => (
                                                <li
                                                    key={log.id}
                                                    className="rounded-lg border bg-white px-3 py-2 text-xs text-slate-600 dark:text-slate-300"
                                                >
                                                    <div>
                                                        {log.startedAt.toLocaleString("ko-KR")}
                                                        {log.endedAt && ` ~ ${log.endedAt.toLocaleString("ko-KR")}`}
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {log.actualMinutes != null && (
                                                            <span>실제 {log.actualMinutes}분</span>
                                                        )}
                                                        {log.blockedReason && (
                                                            <span className="text-amber-700">
                                                                막힘: {log.blockedReason}
                                                            </span>
                                                        )}
                                                        {log.note && <span>메모: {log.note}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* 계획 수정 폼 */}
            <section className="card p-6">
                <h3 className="mb-4 font-semibold">계획 수정</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    수정하면 현재 내용이 이력으로 자동 저장됩니다.
                </p>
                <form action={updatePlan} className="space-y-4">
                    <input type="hidden" name="id" value={plan.id} />
                    <div>
                        <label className="mb-1 block text-sm font-medium">제목 *</label>
                        <input
                            name="title"
                            required
                            defaultValue={plan.title}
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">설명</label>
                        <textarea
                            name="description"
                            rows={2}
                            defaultValue={plan.description ?? ""}
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">시작일</label>
                            <input
                                type="date"
                                name="startDate"
                                defaultValue={formatDate(plan.startDate)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">종료일</label>
                            <input
                                type="date"
                                name="endDate"
                                defaultValue={formatDate(plan.endDate)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">우선순위</label>
                            <select
                                name="priority"
                                defaultValue={String(plan.priority)}
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
                                defaultValue={plan.estimatedMinutes ?? ""}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">성공 기준</label>
                            <input
                                name="successCriteria"
                                defaultValue={plan.successCriteria ?? ""}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">수정 메모 (선택)</label>
                        <input
                            name="changeNote"
                            placeholder="예: 마감일을 이틀 늦춤"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-zinc-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        수정 저장 (이력 남기기)
                    </button>
                </form>
            </section>

            {/* 수정 이력 */}
            <section className="space-y-4">
                <h3 className="font-semibold">수정 이력</h3>
                {plan.versions.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        아직 수정 이력이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {plan.versions.map((version) => (
                            <li key={version.id} className="rounded-xl border bg-white p-4 text-sm shadow-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium">{version.title}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {version.changedAt.toLocaleString("ko-KR")}
                                    </span>
                                </div>
                                {version.changeNote && (
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">메모: {version.changeNote}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}