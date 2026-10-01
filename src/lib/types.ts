export type Concept = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  position?: number;
};

export type Problem = {
  id: string;
  user_id: string;
  number: string | null;
  title: string;
  platform: string;
  url: string | null;
  difficulty: "Easy" | "Medium" | "Hard";
  concept_id: number;
  code: string;
  time_complexity: string;
  space_complexity: string;
  created_at: string;
};

export type ProblemInput = Omit<Problem, "id" | "created_at" | "user_id">;
