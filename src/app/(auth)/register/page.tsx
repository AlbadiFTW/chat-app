"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); }
    else router.push("/login");
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-white/20">
          <MessageSquare className="w-7 h-7 text-black" />
        </div>
        <h1 className="text-3xl font-semibold text-white">Create account</h1>
        <p className="text-white/60 text-sm mt-2">Start chatting with your team today</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Name</label>
            <Input
              name="name"
              required
              placeholder="Abdul Rahman"
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 h-11"
            />
          </div>
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
              minLength={6}
              placeholder="Min. 6 characters"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-white/50 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:text-white/70 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}