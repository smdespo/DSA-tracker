import { getConcepts } from "@/lib/db";
import { saveProblem } from "@/lib/actions";
import { ProblemForm } from "@/components/bits";

export default async function NewProblem() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Add problem</h1>
      <ProblemForm concepts={await getConcepts()} action={saveProblem} />
    </div>
  );
}
