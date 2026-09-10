"use client";

import { motion } from "framer-motion";

export function PlanDetailShell({
    planId,
    title,
    children,
}: {
    planId: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            key={planId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-10"
        >
            <motion.h2
                layoutId={`plan-title-${planId}`}
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
                {title}
            </motion.h2>
            {children}
        </motion.div>
    );
}