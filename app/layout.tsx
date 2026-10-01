import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = { title: "DSA", description: "My DSA solutions" };
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex bg-[#0a0c10] text-slate-200 antialiased">
        <Sidebar />
        <main className="h-screen min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
