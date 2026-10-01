import Link from "next/link";
import type { Concept, Problem } from "@/lib/db";

export const inp =
  "w-full rounded-lg border border-white/10 bg-[#0f1219] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500";
export const btn =
  "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500";
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
  if (!problems.length)
    return <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No problems yet. Add your first one.</p>;
  const name = (id: number) => concepts.find((c) => c.id === id)?.name ?? "";
  return (
    <div className="space-y-2">
      {problems.map((p) => (
        <Link key={p.id} href={`/problems/${p.id}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#11141c] p-4 hover:border-indigo-500/50">
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-100">
              {p.number && <span className="mr-2 text-indigo-400">#{p.number}</span>}{p.title}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {p.platform} · {name(p.concept_id)} · Time {p.time_complexity || "—"} · Space {p.space_complexity || "—"}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Difficulty d={p.difficulty} />
            <span className="text-sm text-indigo-400">View Solution</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ProblemForm({ concepts, p, action }: { concepts: Concept[]; p?: Problem; action: (fd: FormData) => Promise<void> }) {
  const tops = concepts.filter((c) => !c.parent_id);
  return (
    <form action={action} className="max-w-3xl space-y-4">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <input name="number" defaultValue={p?.number ?? ""} placeholder="Number (239)" className={inp} />
        <input name="title" required defaultValue={p?.title} placeholder="Title" className={`${inp} sm:col-span-3`} />
      </div>
      <input name="url" type="url" defaultValue={p?.url ?? ""} placeholder="Problem URL" className={inp} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select name="platform" defaultValue={p?.platform ?? "LeetCode"} className={inp}>
          {["LeetCode", "GeeksforGeeks", "Codeforces", "CodeChef", "Other"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select name="difficulty" defaultValue={p?.difficulty ?? "Medium"} className={inp}>
          {["Easy", "Medium", "Hard"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select name="concept_id" required defaultValue={p?.concept_id} className={inp}>
          {tops.map((t) => {
            const kids = concepts.filter((c) => c.parent_id === t.id);
            return kids.length ? (
              <optgroup key={t.id} label={t.name}>
                <option value={t.id}>{t.name} (general)</option>
                {kids.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </optgroup>
            ) : <option key={t.id} value={t.id}>{t.name}</option>;
          })}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input name="time_complexity" defaultValue={p?.time_complexity} placeholder="Time: O(n)" className={inp} />
        <input name="space_complexity" defaultValue={p?.space_complexity} placeholder="Space: O(k)" className={inp} />
      </div>
      <textarea name="code" rows={18} defaultValue={p?.code} placeholder="// my C++ solution" spellCheck={false} className={`${inp} font-mono`} />
      <button className={btn}>Save problem</button>
    </form>
  );
}
