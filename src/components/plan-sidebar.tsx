"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type PlanItem = {
    id: string;
    title: string;
    priority: number;
    todoCount: number;
};

export function PlanSidebar({ plans }: { plans: PlanItem[] }) {
    const pathname = usePathname();

    return (
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
                    {plans.map((plan) => {
                        const href = `/plans/${plan.id}`;
                        const active = pathname === href;

                        return (
                            <li key={plan.id}>
                                <Link
                                    href={href}
                                    className={`block rounded-xl px-3 py-3 transition ${active
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                        }`}
                                >
                                    <motion.p
                                        layoutId={`plan-title-${plan.id}`}
                                        className="line-clamp-1 text-sm font-medium"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    >
                                        {plan.title}
                                    </motion.p>
                                    <p
                                        className={`mt-1 text-xs ${active ? "opacity-80" : "text-slate-500 dark:text-slate-400"
                                            }`}
                                    >
                                        할 일 {plan.todoCount}개 · 우선순위 {plan.priority}
                                    </p>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </aside>
    );
}