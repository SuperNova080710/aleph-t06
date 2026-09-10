"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type NavItem = {
    key: string;
    label: string;
    count: number;
};

export function ReviewShell({
    focus,
    navItems,
    estimatedSum,
    actualSum,
    diff,
    children,
}: {
    focus: string;
    navItems: NavItem[];
    estimatedSum: number;
    actualSum: number;
    diff: number;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="card h-fit p-4 lg:sticky lg:top-24">
                <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    돌아보기 메뉴
                </h2>
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const active = focus === item.key;
                        return (
                            <li key={item.key}>
                                <Link
                                    href={`/review?focus=${item.key}`}
                                    className={`block rounded-xl px-3 py-3 text-sm transition ${active
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <motion.span
                                            layoutId={`review-label-${item.key}`}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                        <span className={active ? "opacity-80" : "text-slate-500 dark:text-slate-400"}>
                                            {item.count}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">예상</span>
                        <span>{estimatedSum}분</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">실제</span>
                        <span>{actualSum}분</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">차이</span>
                        <span>
                            {diff >= 0 ? "+" : ""}
                            {diff}분
                        </span>
                    </div>
                </div>
            </aside>

            <motion.div
                key={focus}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-8"
            >
                {children}
            </motion.div>
        </div>
    );
}