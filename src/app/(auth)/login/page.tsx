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
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        callbackUrl: "/chat",
        redirect: true,
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Unable to sign in");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-white/20">
          <MessageSquare className="w-7 h-7 text-black" />
        </div>
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="text-white/60 text-sm mt-2">Sign in to continue to ChatApp</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Password</label>
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 h-11"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white text-black hover:bg-white/90 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-white/50 mt-6">
          No account?{" "}
          <Link href="/register" className="text-white hover:text-white/70 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}