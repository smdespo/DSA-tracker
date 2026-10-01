import Link from "next/link";
import { notFound } from "next/navigation";
import { db, getConcepts, Problem } from "@/lib/db";
import { ProblemList, btn } from "@/components/bits";

export default async function ConceptPage({ params }: { params: { slug: string } }) {
  const all = await getConcepts();
  const c = all.find((x) => x.slug === params.slug);
  if (!c) notFound();
  const kids = all.filter((x) => x.parent_id === c.id);
  const { data } = await db.from("problems").select("*").in("concept_id", [c.id, ...kids.map((k) => k.id)]).order("created_at");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{c.name}</h1>
        <Link href="/problems/new" className={btn}>Add problem</Link>
      </div>
      {kids.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {kids.map((k) => <Link key={k.id} href={`/concepts/${k.slug}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/50">{k.name}</Link>)}
        </div>
      )}
      <ProblemList problems={(data ?? []) as Problem[]} concepts={all} />
    </div>
  );
}
