import Link from "next/link";
import { db, getConcepts, Problem } from "@/lib/db";
import { ProblemList, btn } from "@/components/bits";

export default async function Problems() {
  const concepts = await getConcepts();
  const { data } = await db.from("problems").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Problems</h1>
        <Link href="/problems/new" className={btn}>Add problem</Link>
      </div>
      <ProblemList problems={(data ?? []) as Problem[]} concepts={concepts} />
    </div>
  );
}
