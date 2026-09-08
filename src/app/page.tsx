export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* T06 필수: 공개 안내 문구 */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
        <p className="font-medium">
          지금은 로그인이 없어 링크를 아는 사람은 누구나 볼 수 있습니다.
        </p>
        <p className="mt-1 text-sm">
          남이 봐도 괜찮은 내용만 넣으세요. (민감한 정보나 다른 사람 정보는 적지 마세요)
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">
          Plan → Do → See
        </h2>
        <p className="text-zinc-600 leading-relaxed">
          계획을 세우고, 실제로 한 일을 기록하고, 돌아보는 다이어리입니다.
          <br />
          내 실제 계획과 기록으로 채워보세요.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <a
          href="/plans"
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold">계획 (Plan)</h3>
          <p className="mt-2 text-sm text-zinc-500">
            기간, 우선순위, 성공 기준을 담은 계획을 만듭니다.
          </p>
        </a>

        <a
          href="/plans"
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold">할 일 & 실행 (Do)</h3>
          <p className="mt-2 text-sm text-zinc-500">
            할 일을 관리하고, 실제로 한 일을 기록합니다.
          </p>
        </a>

        <a
          href="/review"
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold">돌아보기 (See)</h3>
          <p className="mt-2 text-sm text-zinc-500">
            예상과 실제를 비교하고 다음 계획을 개선합니다.
          </p>
        </a>
      </section>
    </div>
  );
}