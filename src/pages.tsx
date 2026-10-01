import { useEffect, useState, type FormEvent } from "react";
import { Link, Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "./auth";
import Sidebar from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Difficulty, ProblemForm, ProblemList, btn, btnGhost, inp } from "./components/bits";
import { Loading, PageError, useRemoteData } from "./components/States";
import { deleteProblem, getConcepts, getProblem, getProblems, saveProblem, searchProblems } from "./lib/data";
import { getSupabase, supabaseConfigError } from "./lib/supabase";
import type { Concept, Problem } from "./lib/types";

export function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const client = getSupabase();
      if (mode === "sign-in") {
        const { error: authError } = await client.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  if (supabaseConfigError) {
    return <div className="mx-auto mt-20 max-w-md rounded-xl border border-rose-500/20 bg-[#11141c] p-6">
      <h1 className="text-xl font-semibold text-white">Supabase configuration required</h1>
      <p role="alert" className="mt-3 text-sm text-rose-300">{supabaseConfigError}</p>
    </div>;
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl border border-white/10 bg-[#11141c] p-6">
      <h1 className="text-2xl font-semibold text-white">DSA tracker</h1>
      <p className="mt-2 text-sm text-slate-400">{mode === "sign-in" ? "Sign in to your account." : "Create an account to keep your solutions private."}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block space-y-1.5 text-sm text-slate-300">
          Email
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inp} />
        </label>
        <label className="block space-y-1.5 text-sm text-slate-300">
          Password
          <input required type="password" minLength={6} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className={inp} />
        </label>
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
        <button disabled={pending} className={`${btn} w-full justify-center`}>{pending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}</button>
      </form>
      <button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); setMessage(null); }} className="mt-4 text-sm text-indigo-300 hover:text-indigo-200">
        {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-slate-200">
      <Sidebar />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-4xl"><Outlet /></div>
      </main>
    </div>
  );
}

function ProblemsPage() {
  const result = useRemoteData(getProblems, []);
  const concepts = useRemoteData(getConcepts, []);
  if (result.status === "loading" || concepts.status === "loading") return <Loading />;
  if (result.status === "error") return <PageError message={result.error} />;
  if (concepts.status === "error") return <PageError message={concepts.error} />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Problems</h1>
        <Link to="/problems/new" className={btn}>Add problem</Link>
      </div>
      <ProblemList problems={result.data} concepts={concepts.data} />
    </div>
  );
}

export function DashboardPage() {
  const result = useRemoteData(async () => Promise.all([getProblems(), getConcepts()]), []);
  if (result.status === "loading") return <Loading />;
  if (result.status === "error") return <PageError message={result.error} />;
  const [problems, concepts] = result.data;
  return <Dashboard problems={problems} concepts={concepts} />;
}

export function ProblemsIndexPage() {
  return <ProblemsPage />;
}

export function NewProblemPage() {
  const concepts = useRemoteData(getConcepts, []);
  if (concepts.status === "loading") return <Loading />;
  if (concepts.status === "error") return <PageError message={concepts.error} />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Add problem</h1>
      <ProblemForm concepts={concepts.data} />
    </div>
  );
}

export function EditProblemPage() {
  const { id = "" } = useParams();
  const result = useRemoteData(() => Promise.all([getProblem(id), getConcepts()]), [id]);
  if (result.status === "loading") return <Loading />;
  if (result.status === "error") return <PageError message={result.error} />;
  const [problem, concepts] = result.data;
  if (!problem) return <PageError message="Problem not found or you do not have access to it." />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Edit problem</h1>
      <ProblemForm concepts={concepts} problem={problem} />
    </div>
  );
}

export function ProblemPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const result = useRemoteData(() => Promise.all([getProblem(id), getConcepts()]), [id]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  if (result.status === "loading") return <Loading />;
  if (result.status === "error") return <PageError message={result.error} />;
  const [problem, concepts] = result.data;
  if (!problem) return <PageError message="Problem not found or you do not have access to it." />;
  const concept = concepts.find((item) => item.id === problem.concept_id);
  const parent = concepts.find((item) => item.id === concept?.parent_id);
  const box = "rounded-xl border border-white/10 bg-[#11141c] p-4";
  const problemId = problem.id;

  async function remove() {
    if (!window.confirm("Delete this problem permanently?")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProblem(problemId);
      navigate("/problems", { replace: true });
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Could not delete problem.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{problem.number && `#${problem.number} — `}{problem.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
            <Difficulty d={problem.difficulty} /> <span>{problem.platform}</span>
            {parent && <Link to={`/concepts/${parent.slug}`} className="hover:text-white">{parent.name}</Link>}
            {concept && <Link to={`/concepts/${concept.slug}`} className="text-indigo-400">{concept.name}</Link>}
          </div>
        </div>
        <div className="flex gap-2">
          {problem.url && <a href={problem.url} target="_blank" rel="noreferrer" className={btn}><ExternalLink className="h-4 w-4" />Open Problem</a>}
          <Link to={`/problems/${problem.id}/edit`} className={btnGhost}><Pencil className="h-4 w-4" />Edit</Link>
          <button type="button" disabled={deleting} onClick={remove} className={btnGhost}><Trash2 className="h-4 w-4" />{deleting ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
      {deleteError && <PageError message={deleteError} />}
      <div className="grid grid-cols-2 gap-3">
        <div className={box}><div className="text-xs text-slate-500">Time Complexity</div><div className="mt-1 font-mono text-white">{problem.time_complexity || "—"}</div></div>
        <div className={box}><div className="text-xs text-slate-500">Space Complexity</div><div className="mt-1 font-mono text-white">{problem.space_complexity || "—"}</div></div>
      </div>
      <section>
        <h2 className="mb-2 font-medium text-white">My Solution</h2>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0d1016] p-4 text-sm leading-relaxed text-slate-200"><code>{problem.code || "// no solution saved yet"}</code></pre>
      </section>
    </div>
  );
}

export function ConceptPage() {
  const { slug = "" } = useParams();
  const result = useRemoteData(async () => {
    const concepts = await getConcepts();
    const concept = concepts.find((item) => item.slug === slug);
    if (!concept) return null;
    const children = concepts.filter((item) => item.parent_id === concept.id);
    const ids = [concept.id, ...children.map((item) => item.id)];
    const { data, error } = await getSupabase()
      .from("problems")
      .select("*")
      .in("concept_id", ids)
      .order("created_at");
    if (error) throw new Error(`Could not load problems for this concept: ${error.message}`);
    return { concepts, concept, children, problems: data as Problem[] };
  }, [slug]);
  if (result.status === "loading") return <Loading />;
  if (result.status === "error") return <PageError message={result.error} />;
  if (!result.data) return <PageError message="Concept not found." />;
  const { concepts, concept, children, problems } = result.data;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{concept.name}</h1>
        <Link to="/problems/new" className={btn}>Add problem</Link>
      </div>
      {children.length > 0 && <div className="flex flex-wrap gap-2">
        {children.map((child) => <Link key={child.id} to={`/concepts/${child.slug}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/50">{child.name}</Link>)}
      </div>}
      <ProblemList problems={problems} concepts={concepts} />
    </div>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const [draft, setDraft] = useState(query);
  const concepts = useRemoteData(getConcepts, []);
  const results = useRemoteData(() => query ? searchProblems(query) : Promise.resolve([]), [query]);
  useEffect(() => setDraft(query), [query]);
  if (concepts.status === "loading" || results.status === "loading") return <Loading />;
  if (concepts.status === "error") return <PageError message={concepts.error} />;
  if (results.status === "error") return <PageError message={results.error} />;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Search</h1>
      <form onSubmit={submit} className="flex gap-2">
        <input name="q" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus placeholder="Title or number" className={inp} />
        <button className={btn}>Search</button>
      </form>
      {query && <ProblemList problems={results.data} concepts={concepts.data} />}
    </div>
  );
}
