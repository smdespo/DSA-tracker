import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { saveProblem } from "../lib/data";
import type { Concept, Problem, ProblemInput } from "../lib/types";

export const inp =
  "w-full rounded-lg border border-white/10 bg-[#0f1219] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500";
export const btn =
  "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm text-slate-300 hover:bg-white/5";

const tone = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function Difficulty({ d }: { d: Problem["difficulty"] }) {
  return <span className={`rounded-md border px-2 py-0.5 text-xs ${tone[d]}`}>{d}</span>;
}

export function ProblemList({ problems, concepts }: { problems: Problem[]; concepts: Concept[] }) {
  if (!problems.length) {
    return <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No problems yet. Add your first one.</p>;
  }
  const name = (id: number) => concepts.find((concept) => concept.id === id)?.name ?? "";
  return (
    <div className="space-y-2">
      {problems.map((problem) => (
        <Link key={problem.id} to={`/problems/${problem.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#11141c] p-4 hover:border-indigo-500/50">
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-100">
              {problem.number && <span className="mr-2 text-indigo-400">#{problem.number}</span>}{problem.title}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {problem.platform} · {name(problem.concept_id)} · Time {problem.time_complexity || "—"} · Space {problem.space_complexity || "—"}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Difficulty d={problem.difficulty} />
            <span className="text-sm text-indigo-400">View Solution</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ProblemForm({ concepts, problem }: { concepts: Concept[]; problem?: Problem }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tops = concepts.filter((concept) => !concept.parent_id);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setError("Sign in again before saving this problem.");
      return;
    }
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const rawDifficulty = String(form.get("difficulty") ?? "");
    if (rawDifficulty !== "Easy" && rawDifficulty !== "Medium" && rawDifficulty !== "Hard") {
      setError("Select a valid difficulty.");
      setSaving(false);
      return;
    }
    const input: ProblemInput = {
      number: String(form.get("number") ?? "").trim() || null,
      title: String(form.get("title") ?? "").trim(),
      platform: String(form.get("platform") ?? "LeetCode"),
      url: String(form.get("url") ?? "").trim() || null,
      difficulty: rawDifficulty,
      concept_id: Number(form.get("concept_id")),
      code: String(form.get("code") ?? ""),
      time_complexity: String(form.get("time_complexity") ?? "").trim(),
      space_complexity: String(form.get("space_complexity") ?? "").trim(),
    };
    try {
      const saved = await saveProblem(input, session.user.id, problem?.id);
      navigate(`/problems/${saved.id}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save problem.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <input name="number" defaultValue={problem?.number ?? ""} placeholder="Number (239)" className={inp} />
        <input name="title" required defaultValue={problem?.title} placeholder="Title" className={`${inp} sm:col-span-3`} />
      </div>
      <input name="url" type="url" defaultValue={problem?.url ?? ""} placeholder="Problem URL" className={inp} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select name="platform" defaultValue={problem?.platform ?? "LeetCode"} className={inp}>
          {["LeetCode", "GeeksforGeeks", "Codeforces", "CodeChef", "Other"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select name="difficulty" defaultValue={problem?.difficulty ?? "Medium"} className={inp}>
          {["Easy", "Medium", "Hard"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select name="concept_id" required defaultValue={problem?.concept_id ?? ""} className={inp}>
          <option value="" disabled>Select concept</option>
          {tops.map((top) => {
            const children = concepts.filter((concept) => concept.parent_id === top.id);
            return children.length ? (
              <optgroup key={top.id} label={top.name}>
                <option value={top.id}>{top.name} (general)</option>
                {children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}
              </optgroup>
            ) : <option key={top.id} value={top.id}>{top.name}</option>;
          })}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input name="time_complexity" defaultValue={problem?.time_complexity} placeholder="Time: O(n)" className={inp} />
        <input name="space_complexity" defaultValue={problem?.space_complexity} placeholder="Space: O(k)" className={inp} />
      </div>
      <textarea name="code" rows={18} defaultValue={problem?.code} placeholder="// my C++ solution" spellCheck={false} className={`${inp} font-mono`} />
      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
      <button disabled={saving} className={btn}>{saving ? "Saving..." : "Save problem"}</button>
    </form>
  );
}
