import { createPlan } from "./actions";

export default function PlansPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    계획 워크스페이스
                </h2>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                    왼쪽에서 계획을 선택하거나, 아래에서 새 계획을 만드세요.
                </p>
            </div>

            <section className="card p-6">
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">
                    새 계획 만들기
                </h3>
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
                            <input
                                type="number"
                                name="estimatedMinutes"
                                min="0"
                                placeholder="예: 120"
                                className="input"
                            />
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
        </div>
    );
}