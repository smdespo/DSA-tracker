import { notFound } from "next/navigation";
import { db, getConcepts, Problem } from "@/lib/db";
import { saveProblem } from "@/lib/actions";
import { ProblemForm } from "@/components/bits";

export default async function EditProblem({ params }: { params: { id: string } }) {
  const { data } = await db.from("problems").select("*").eq("id", params.id).single();
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Edit problem</h1>
      <ProblemForm concepts={await getConcepts()} p={data as Problem} action={saveProblem} />
    </div>
  );
}
