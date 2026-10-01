import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { db, getConcepts, Problem } from "@/lib/db";
import { deleteProblem } from "@/lib/actions";
import { Difficulty, btn, btnGhost } from "@/components/bits";

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const { data } = await db.from("problems").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const p = data as Problem;
  const concepts = await getConcepts();
  const c = concepts.find((x) => x.id === p.concept_id);
  const parent = concepts.find((x) => x.id === c?.parent_id);
  const box = "rounded-xl border border-white/10 bg-[#11141c] p-4";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{p.number && `#${p.number} — `}{p.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
            <Difficulty d={p.difficulty} /> <span>{p.platform}</span>
            {parent && <Link href={`/concepts/${parent.slug}`} className="hover:text-white">{parent.name}</Link>}
            {c && <Link href={`/concepts/${c.slug}`} className="text-indigo-400">{c.name}</Link>}
          </div>
        </div>
        <div className="flex gap-2">
          {p.url && <a href={p.url} target="_blank" rel="noreferrer" className={btn}><ExternalLink className="h-4 w-4" />Open Problem</a>}
          <Link href={`/problems/${p.id}/edit`} className={btnGhost}><Pencil className="h-4 w-4" />Edit</Link>
          <form action={deleteProblem}><input type="hidden" name="id" value={p.id} />
            <button className={btnGhost}><Trash2 className="h-4 w-4" />Delete</button></form>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={box}><div className="text-xs text-slate-500">Time Complexity</div><div className="mt-1 font-mono text-white">{p.time_complexity || "—"}</div></div>
        <div className={box}><div className="text-xs text-slate-500">Space Complexity</div><div className="mt-1 font-mono text-white">{p.space_complexity || "—"}</div></div>
      </div>
      <section>
        <h2 className="mb-2 font-medium text-white">My Solution</h2>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d1016] p-4 text-sm leading-relaxed text-slate-200"><code>{p.code || "// no solution saved yet"}</code></pre>
      </section>
    </div>
  );
}
