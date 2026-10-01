import { getSupabase } from "./supabase";
import type { Concept, Problem, ProblemInput } from "./types";

export async function getConcepts(): Promise<Concept[]> {
  const { data, error } = await getSupabase()
    .from("concepts")
    .select("*")
    .order("position");
  if (error) throw new Error(`Could not load concepts: ${error.message}`);
  return data as Concept[];
}

export async function getProblems(): Promise<Problem[]> {
  const { data, error } = await getSupabase()
    .from("problems")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load problems: ${error.message}`);
  return data as Problem[];
}

export async function getProblem(id: string): Promise<Problem | null> {
  const { data, error } = await getSupabase()
    .from("problems")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load problem: ${error.message}`);
  return data as Problem | null;
}

export async function searchProblems(query: string): Promise<Problem[]> {
  const db = getSupabase();
  const pattern = `%${query}%`;
  const [byTitle, byNumber] = await Promise.all([
    db.from("problems").select("*").ilike("title", pattern).limit(50),
    db.from("problems").select("*").ilike("number", pattern).limit(50),
  ]);
  if (byTitle.error) throw new Error(`Could not search problem titles: ${byTitle.error.message}`);
  if (byNumber.error) throw new Error(`Could not search problem numbers: ${byNumber.error.message}`);
  const unique = new Map<string, Problem>();
  for (const problem of [...(byTitle.data ?? []), ...(byNumber.data ?? [])]) {
    unique.set(problem.id, problem as Problem);
  }
  return [...unique.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function saveProblem(
  input: ProblemInput,
  userId: string,
  id?: string,
): Promise<Problem> {
  const db = getSupabase();
  const result = id
    ? await db.from("problems").update(input).eq("id", id).select("*").single()
    : await db
        .from("problems")
        .insert({ ...input, user_id: userId })
        .select("*")
        .single();
  if (result.error) throw new Error(`Could not save problem: ${result.error.message}`);
  return result.data as Problem;
}

export async function deleteProblem(id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from("problems")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Could not delete problem: ${error.message}`);
  if (!data) throw new Error("Problem was not found or you do not have permission to delete it.");
}
