import { prisma } from "@/lib/prisma";
import { PlanSidebar } from "@/components/plan-sidebar";

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
            <PlanSidebar
                plans={plans.map((plan) => ({
                    id: plan.id,
                    title: plan.title,
                    priority: plan.priority,
                    todoCount: plan._count.todos,
                }))}
            />
            <section className="min-w-0">{children}</section>
        </div>
    );
}