import Link from "next/link";
import { MessageSquare, Zap, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white">
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg">ChatApp</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-violet-300 hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm px-4 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          Real-time team communication
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Chat with your team,{" "}
          <span className="text-violet-400">in real time</span>
        </h1>
        <p className="text-violet-300/70 text-xl max-w-2xl mx-auto">
          ChatApp brings your team together with instant messaging, channel organization, and live presence — all in one place.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Link href="/register" className="px-8 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl font-medium transition-colors">
            Start for free
          </Link>
          <Link href="/login" className="px-8 py-3 border border-violet-700 hover:border-violet-500 rounded-xl text-violet-300 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Real-time messaging", desc: "Messages delivered instantly with Socket.io — no refresh needed.", color: "text-violet-400", bg: "bg-violet-500/10" },
          { icon: Users, title: "Team channels", desc: "Organize conversations by topic with public channels anyone can join.", color: "text-pink-400", bg: "bg-pink-500/10" },
          { icon: Shield, title: "Secure by default", desc: "JWT authentication keeps your conversations private and secure.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(f => (
          <div key={f.title} className="bg-[#160d2e] border border-violet-900/40 rounded-2xl p-6 space-y-3">
            <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-violet-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-violet-900/30 py-8 text-center text-violet-600 text-sm">
        ChatApp — Built with Next.js, Socket.io & PostgreSQL
      </footer>
    </div>
  );
}