import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updatePlan } from "../actions";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: Props) {
    const { id } = await params;

    const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
            versions: {
                orderBy: { changedAt: "desc" },
            },
            _count: {
                select: { todos: true },
            },
        },
    });

    if (!plan) notFound();

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toISOString().slice(0, 10);
    };

    return (
        <div className="space-y-10">
            <div>
                <a href="/plans" className="text-sm text-zinc-500 hover:text-zinc-800">
                    ← 계획 목록
                </a>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">{plan.title}</h2>
                {plan.description && (
                    <p className="mt-1 text-zinc-600">{plan.description}</p>
                )}
            </div>

            {/* 현재 계획 정보 */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">현재 계획</h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-zinc-500">우선순위</dt>
                        <dd className="font-medium">{plan.priority}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">예상 시간</dt>
                        <dd className="font-medium">
                            {plan.estimatedMinutes ? `${plan.estimatedMinutes}분` : "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">기간</dt>
                        <dd className="font-medium">
                            {formatDate(plan.startDate) || "-"} ~ {formatDate(plan.endDate) || "-"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">할 일 수</dt>
                        <dd className="font-medium">{plan._count.todos}개</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-zinc-500">성공 기준</dt>
                        <dd className="font-medium">{plan.successCriteria || "-"}</dd>
                    </div>
                </dl>
            </section>

            {/* 수정 폼 */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">계획 수정</h3>
                <p className="mb-4 text-sm text-zinc-500">
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
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-zinc-500">
                        아직 수정 이력이 없습니다.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {plan.versions.map((version) => (
                            <li
                                key={version.id}
                                className="rounded-xl border bg-white p-4 text-sm shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium">{version.title}</span>
                                    <span className="text-xs text-zinc-500">
                                        {version.changedAt.toLocaleString("ko-KR")}
                                    </span>
                                </div>
                                {version.changeNote && (
                                    <p className="mt-1 text-zinc-600">메모: {version.changeNote}</p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                                    <span>우선순위 {version.priority}</span>
                                    {version.estimatedMinutes && (
                                        <span>예상 {version.estimatedMinutes}분</span>
                                    )}
                                    {version.successCriteria && (
                                        <span>성공 기준: {version.successCriteria}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}