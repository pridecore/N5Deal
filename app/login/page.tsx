import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="noise min-h-screen overflow-hidden bg-[#f4f1ea]">
      <div className="fine-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[1fr_460px]">
        <section className="relative flex min-h-[480px] flex-col justify-between px-7 py-7 sm:px-12 sm:py-10 lg:min-h-screen lg:px-20 lg:py-12">
          <div className="flex items-center gap-3 rise">
            <span className="flex h-9 w-9 items-center justify-center bg-[#172532] text-xs font-bold tracking-[-.08em] text-[#f4f1ea]">N5</span>
            <span className="text-xs font-bold tracking-[.18em] text-[#172532]">N5DEAL</span>
          </div>
          <div className="max-w-[660px] pb-6 lg:pb-20">
            <div className="eyebrow mb-6 rise rise-delay">The private market, made legible.</div>
            <h1 className="display max-w-[680px] text-[clamp(3.4rem,8vw,7.8rem)] leading-[.88] tracking-[-.06em] text-[#172532] rise rise-delay-2">
              Serious capital<br /><em className="text-[#b7653b]">meets</em> clear intent.
            </h1>
            <p className="mt-8 max-w-[430px] text-[15px] leading-7 text-[#50606a] rise rise-delay-2">
              A considered place for acquisition opportunities, financial assets, and the people ready to move them forward.
            </p>
          </div>
          <div className="hidden items-end justify-between border-t border-[#d9d4c9] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#7a817f] lg:flex rise rise-delay-2">
            <span>Private deal room · 2025</span><span>01 / Access</span>
          </div>
        </section>
        <section className="relative flex items-center border-t border-[#d9d4c9] bg-[#172532] px-7 py-14 text-[#f4f1ea] sm:px-12 lg:border-l lg:border-t-0 lg:px-14">
          <div className="absolute right-8 top-8 h-20 w-20 rounded-full border border-[#d49a79]/40" aria-hidden="true"><span className="absolute left-1/2 top-[-5px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#d49a79]" /></div>
          <div className="relative w-full max-w-[330px] rise">
            <div className="mb-14"><p className="eyebrow text-[#d49a79]">Welcome back</p><h2 className="display mt-3 text-4xl tracking-[-.04em]">Enter the room.</h2></div>
            <LoginForm />
            <p className="mt-12 border-t border-white/15 pt-5 text-[11px] leading-5 text-white/45">Demo access is available for Buyer, Seller, and Manager roles. Your session is stored securely on the server.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
