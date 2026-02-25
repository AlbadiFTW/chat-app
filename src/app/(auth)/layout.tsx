export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[12%] top-[-20%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(98,127,255,0.55),rgba(0,0,0,0))] blur-3xl animate-float-slow" />
        <div className="absolute -left-[18%] bottom-[-30%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,92,71,0.45),rgba(0,0,0,0))] blur-3xl animate-float-slower" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.12]" />
        <div className="absolute inset-0 landing-noise opacity-40" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}