import { useSettings } from "../hooks/useSettings";
import { useReadingPlan } from "../hooks/useReadingPlan";
import plansData from "../data/plans.json";
import { Link } from "react-router-dom";
import type { Plan } from "../types/plan";

export default function PlansPage() {
  const { settings, update } = useSettings();
  const { loadPlan, info } = useReadingPlan();

  const startPlan = async (planId: string) => {
    await update({ activePlanId: planId });
    await loadPlan(planId);
  };

  const isActive = settings.activePlanId;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reading Plans</h2>
      <p className="text-gray-500">
        Pick a plan to get a daily reading assignment and track your progress.
      </p>

      <div className="space-y-3">
        {plansData.plans.map((plan: Plan) => {
          const active = isActive === plan.id;
          const already = info && info.plan.id === plan.id && info.started;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 ${active ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-800"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                  <p className="text-xs text-gray-400">
                    {plan.days} days ·{" "}
                    {plan.books.reduce((sum, b) => sum + b.chapters, 0)}{" "}
                    chapters
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {active ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                      Active
                    </span>
                  ) : already ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                      Started
                    </span>
                  ) : (
                    <button
                      onClick={() => startPlan(plan.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
              {active && (
                <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                  {`Day ${(info?.day ?? 0) + 1} of ${plan.days} — ${Math.round((info?.progress ?? 0) * 100)}% complete`}
                </p>
              )}
              <Link
                to={`/plan/${plan.id}`}
                className="mt-2 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open plan
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
