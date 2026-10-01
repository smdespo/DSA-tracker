import { ArrowRight, BookOpen, Braces, ChartNoAxesColumnIncreasing, Code2, Flame, Layers3, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Difficulty, ProblemList, btn } from "./bits";
import type { Concept, Problem } from "../lib/types";

const difficultyStyles = {
  Easy: { color: "#34d399", text: "text-emerald-300", bar: "bg-emerald-400" },
  Medium: { color: "#fbbf24", text: "text-amber-300", bar: "bg-amber-400" },
  Hard: { color: "#fb7185", text: "text-rose-300", bar: "bg-rose-400" },
} as const;

export function Dashboard({ problems, concepts }: { problems: Problem[]; concepts: Concept[] }) {
  const easy = problems.filter((problem) => problem.difficulty === "Easy").length;
  const medium = problems.filter((problem) => problem.difficulty === "Medium").length;
  const hard = problems.filter((problem) => problem.difficulty === "Hard").length;
  const total = problems.length;
  const counts = { Easy: easy, Medium: medium, Hard: hard };
  const degrees = {
    easy: total ? (easy / total) * 360 : 0,
    medium: total ? ((easy + medium) / total) * 360 : 0,
  };
  const chartStyle = total
    ? {
        background: `conic-gradient(${difficultyStyles.Easy.color} 0deg ${degrees.easy}deg, ${difficultyStyles.Medium.color} ${degrees.easy}deg ${degrees.medium}deg, ${difficultyStyles.Hard.color} ${degrees.medium}deg 360deg)`,
      }
    : { background: "#252a36" };
  const conceptCounts = concepts
    .map((concept) => ({
      ...concept,
      count: problems.filter((problem) => problem.concept_id === concept.id).length,
    }))
    .filter((concept) => concept.count > 0)
    .sort((a, b) => b.count - a.count || a.position! - b.position!)
    .slice(0, 6);
  const maxConceptCount = Math.max(1, ...conceptCounts.map((concept) => concept.count));
  const recentProblems = [...problems]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);
  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-400/15 bg-gradient-to-br from-[#1b1b38] via-[#15182b] to-[#10141c] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-indigo-200/70">
              <Sparkles className="h-4 w-4" /> Your DSA workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your progress, at a glance.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Every problem solved is another pattern mastered. Keep building your personal solution library.
            </p>
            <p className="mt-4 text-xs text-slate-500">{today}</p>
          </div>
          <Link to="/problems/new" className={`${btn} shrink-0 rounded-xl px-4 py-3 shadow-lg shadow-indigo-950/40`}>
            <Code2 className="h-4 w-4" /> Add a problem
          </Link>
        </div>
        <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Problems practiced</p>
            <p className="mt-1 text-xl font-semibold text-white">{total}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Concepts covered</p>
            <p className="mt-1 text-xl font-semibold text-white">{new Set(problems.map((problem) => problem.concept_id)).size}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400">Your next step</p>
            <Link to={total ? "/search" : "/problems/new"} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-200 hover:text-white">
              {total ? "Find a problem to revisit" : "Log your first solution"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Problem statistics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total solved" count={total} detail="In your library" icon={<BookOpen className="h-5 w-5" />} color="indigo" />
        <StatCard label="Easy" count={easy} detail="Build your foundation" icon={<Target className="h-5 w-5" />} color="emerald" />
        <StatCard label="Medium" count={medium} detail="Strengthen your patterns" icon={<Layers3 className="h-5 w-5" />} color="amber" />
        <StatCard label="Hard" count={hard} detail="Take on a challenge" icon={<Flame className="h-5 w-5" />} color="rose" />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.07] bg-[#11141c] p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Difficulty breakdown</h2>
              <p className="mt-1 text-xs text-slate-500">Your practice mix</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-2 text-slate-400"><ChartNoAxesColumnIncreasing className="h-4 w-4" /></div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <div
              role="img"
              aria-label={`Difficulty distribution: ${easy} easy, ${medium} medium, ${hard} hard`}
              className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full"
              style={chartStyle}
            >
              <div className="grid h-[7.4rem] w-[7.4rem] place-content-center rounded-full bg-[#11141c] text-center">
                <span className="text-3xl font-semibold tracking-tight text-white">{total}</span>
                <span className="mt-0.5 text-[11px] text-slate-500">problems</span>
              </div>
            </div>
            <div className="w-full space-y-4 sm:max-w-40">
              {(["Easy", "Medium", "Hard"] as const).map((difficulty) => {
                const count = counts[difficulty];
                const percent = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={difficulty} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${difficultyStyles[difficulty].bar}`} />
                      <span className="text-sm text-slate-300">{difficulty}</span>
                    </div>
                    <span className="text-sm tabular-nums text-slate-400">{count} <span className="text-xs text-slate-600">({percent}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#11141c] p-5 sm:p-6 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Concepts in practice</h2>
              <p className="mt-1 text-xs text-slate-500">Where your solutions are grouped</p>
            </div>
            <Braces className="mt-1 h-4 w-4 text-slate-500" />
          </div>
          {conceptCounts.length ? (
            <div className="mt-6 space-y-4">
              {conceptCounts.map((concept) => (
                <Link key={concept.id} to={`/concepts/${concept.slug}`} className="group block">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-300 group-hover:text-white">{concept.name}</span>
                    <span className="shrink-0 tabular-nums text-slate-500">{concept.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-[width] duration-500"
                      style={{ width: `${Math.max(5, (concept.count / maxConceptCount) * 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-7 text-center">
              <p className="text-sm text-slate-400">Your concept chart will grow with your solutions.</p>
              <Link to="/problems/new" className="mt-2 inline-block text-xs text-indigo-300 hover:text-indigo-200">Add your first problem</Link>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recently practiced</h2>
            <p className="mt-1 text-xs text-slate-500">Pick up where you left off</p>
          </div>
          <Link to="/problems" className="shrink-0 text-sm text-indigo-300 hover:text-indigo-200">All problems <ArrowRight className="mb-0.5 inline h-3.5 w-3.5" /></Link>
        </div>
        <ProblemList problems={recentProblems} concepts={concepts} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  count,
  detail,
  icon,
  color,
}: {
  label: string;
  count: number;
  detail: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    indigo: "border-indigo-400/15 bg-indigo-400/10 text-indigo-300",
    emerald: "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    amber: "border-amber-400/15 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/15 bg-rose-400/10 text-rose-300",
  };
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#11141c] p-4 transition-colors hover:border-white/[0.13] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400 sm:text-sm">{label}</span>
        <span className={`rounded-xl border p-2 ${colors[color]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{count}</p>
      <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{detail}</p>
    </div>
  );
}
