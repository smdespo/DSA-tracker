import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Loading } from "./components/States";
import { supabaseConfigError } from "./lib/supabase";
import {
  AppLayout,
  AuthPage,
  ConceptPage,
  DashboardPage,
  EditProblemPage,
  NewProblemPage,
  ProblemPage,
  ProblemsIndexPage,
  SearchPage,
} from "./pages";

function ProtectedLayout() {
  const { session, loading, error } = useAuth();
  if (supabaseConfigError) return <AuthPage />;
  if (loading) return <Loading />;
  if (error) return <p role="alert" className="p-8 text-rose-300">Could not restore your session: {error}</p>;
  if (!session) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  const { session, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={loading ? <Loading /> : session ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="problems" element={<ProblemsIndexPage />} />
        <Route path="problems/new" element={<NewProblemPage />} />
        <Route path="problems/:id" element={<ProblemPage />} />
        <Route path="problems/:id/edit" element={<EditProblemPage />} />
        <Route path="concepts/:slug" element={<ConceptPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<p className="text-slate-400">Page not found.</p>} />
      </Route>
    </Routes>
  );
}
