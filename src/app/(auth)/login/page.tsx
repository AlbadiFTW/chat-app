"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (result?.error) { setError("Invalid email or password"); setLoading(false); }
    else window.location.href = "/chat";
  }

  return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-violet-400 text-sm mt-1">Sign in to continue to ChatApp</p>
        </div>

        <div className="bg-[#160d2e] border border-violet-900/40 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-violet-300 text-sm font-medium">Email</label>
              <Input name="email" type="email" required
                placeholder="you@example.com"
                className="bg-[#1e1040] border-violet-800/50 text-white placeholder:text-violet-700 focus:border-violet-500 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-violet-300 text-sm font-medium">Password</label>
              <Input name="password" type="password" required
                placeholder="••••••••"
                className="bg-[#1e1040] border-violet-800/50 text-white placeholder:text-violet-700 focus:border-violet-500 h-11" />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm text-violet-500 mt-6">
            No account?{" "}
            <Link href="/register" className="text-violet-300 hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}