import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export default function Home() {
  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#0b0b0f] text-white ${spaceGrotesk.variable}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(98,127,255,0.55),rgba(0,0,0,0))] blur-3xl animate-float-slow" />
        <div className="absolute -left-[15%] bottom-[-25%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,92,71,0.45),rgba(0,0,0,0))] blur-3xl animate-float-slower" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.12]" />
        <div className="absolute inset-0 landing-noise opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-24 pt-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            <span className="font-display text-lg font-semibold tracking-tight">ChatApp</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="#signal" className="transition hover:text-white">
              Signal
            </Link>
            <Link href="#access" className="transition hover:text-white">
              Access
            </Link>
          </nav>
          <Link
            href="/register"
            className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/50 hover:text-white"
          >
            Get started
          </Link>
        </header>

        <section id="signal" className="mt-16 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-6">
              <h1 className="font-display text-5xl font-semibold leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                Chat built for
                <span className="block text-white">decisions, not noise.</span>
              </h1>
              <p className="max-w-xl text-base text-white/70 sm:text-lg">
                Real-time rooms, crisp signals, and focus-first design.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Start free
              </Link>
              <Link
                href="/chat"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                Explore live
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.25em] text-white/50">
              <span>End-to-end encrypted</span>
              <span>30ms sync</span>
              <span>99.99% uptime</span>
            </div>
          </div>

          <div className="relative animate-fade-up-delay-1">
            <div className="absolute -inset-4 rounded-[32px] border border-white/10 bg-white/5 blur-2xl" />
            <div className="relative rounded-[28px] border border-white/15 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>Live room</span>
                <span>8 online</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/90">Launch window is locked. Shipping in 2 hours.</p>
                </div>
                <div className="ml-8 rounded-2xl border border-white/15 bg-black/40 p-4">
                  <p className="text-sm text-white/80">Signal looks clean. Pushing final build.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm text-white/90">All hands green. Rollout begins.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-9 w-9 rounded-full border border-white/20 bg-[linear-gradient(135deg,#9ad5ff,#4f7cff)]" />
                  <div className="h-9 w-9 rounded-full border border-white/20 bg-[linear-gradient(135deg,#ffcaa2,#ff6a4a)]" />
                  <div className="h-9 w-9 rounded-full border border-white/20 bg-[linear-gradient(135deg,#c7ffb0,#5cffb1)]" />
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Focus mode</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Precision rooms",
              desc: "Every thread stays on mission.",
            },
            {
              title: "Adaptive signal",
              desc: "Smart prioritization, zero clutter.",
            },
            {
              title: "Executive ready",
              desc: "Premium controls and quiet power.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 transition hover:border-white/30"
            >
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </section>

        <section
          id="access"
          className="mt-24 flex flex-col items-start justify-between gap-10 rounded-[36px] border border-white/15 bg-white/5 p-10 backdrop-blur lg:flex-row lg:items-center"
        >
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Ready to make every message count?
            </h2>
            <p className="text-sm text-white/60">Bring your team into a room that feels premium.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              Create workspace
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
