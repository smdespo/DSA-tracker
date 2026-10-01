import { db, getConcepts, Problem } from "@/lib/db";
import { ProblemList, inp, btn } from "@/components/bits";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").replace(/[,()%]/g, " ").trim();
  const concepts = await getConcepts();
  const { data } = q
    ? await db.from("problems").select("*").or(`title.ilike.%${q}%,number.ilike.%${q}%`).limit(50)
    : { data: [] };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Search</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} autoFocus placeholder="Title or number" className={inp} />
        <button className={btn}>Search</button>
      </form>
      {q && <ProblemList problems={(data ?? []) as Problem[]} concepts={concepts} />}
    </div>
  );
}
