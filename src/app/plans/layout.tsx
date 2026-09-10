import { prisma } from "@/lib/prisma";
import { PlanSidebar } from "@/components/plan-sidebar";
import { cache } from "react";

const getPlansForSidebar = cache(async () => {
  return prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      priority: true,
      _count: { select: { todos: true } },
    },
  });
});

export default async function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plans = await getPlansForSidebar();

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