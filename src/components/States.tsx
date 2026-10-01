import { useEffect, useState, type DependencyList } from "react";

type RemoteState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export function useRemoteData<T>(load: () => Promise<T>, dependencies: DependencyList) {
  const [state, setState] = useState<RemoteState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", data: null, error: null });
    load()
      .then((data) => {
        if (active) setState({ status: "success", data, error: null });
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            status: "error",
            data: null,
            error: cause instanceof Error ? cause.message : "Something went wrong.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, dependencies);

  return state;
}

export function Loading() {
  return <p className="py-8 text-sm text-slate-400">Loading...</p>;
}

export function PageError({ message }: { message: string }) {
  return <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{message}</p>;
}
