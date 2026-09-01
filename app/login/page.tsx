import { LoginForm } from "@/components/login-form";

const marketRows = [
  { label: "Regulated businesses", detail: "Bank, EMI, payment and fintech opportunities" },
  { label: "Acquisition intelligence", detail: "Buyer criteria with deterministic Smart Match" },
  { label: "Private deal workflow", detail: "Role-aware messaging, moderation and audit" },
];

export default function LoginPage() {
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
    <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-[1120px] overflow-hidden border border-[#d8e1dd] bg-white shadow-[0_16px_48px_rgba(16,24,22,.08)] lg:min-h-[680px] lg:grid-cols-[1fr_410px]">
      <section className="login-market-scene relative flex flex-col overflow-hidden px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
        <div className="deal-room-backdrop" aria-hidden="true">
          <div className="deal-depth-plane deal-depth-plane-a" />
          <div className="deal-depth-plane deal-depth-plane-b" />
          <div className="deal-depth-ledger">
            <span />
            <span />
            <span />
          </div>
        </div>
        <header className="relative z-10 flex items-center justify-between gap-4 border-b border-[#d8e1dd] pb-5">
          <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#084c3c] text-[11px] font-extrabold text-white">N5</span><div><p className="text-[13px] font-extrabold tracking-[.08em]">N5DEAL</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-[.08em] text-[#6b7873]">Private market</p></div></div>
          <span className="deal-badge status-live">Secure demo</span>
        </header>
        <div className="relative z-10 flex flex-1 flex-col justify-center py-8 lg:py-12">
          <p className="eyebrow rise">Marketplace access</p>
          <h1 className="display mt-3 max-w-[600px] text-[clamp(2rem,4.5vw,3.35rem)] leading-[1.04] text-[#101816] rise rise-delay">Financial opportunities, qualified counterparties, one private workspace.</h1>
          <p className="mt-5 max-w-[580px] text-sm leading-6 text-[#52615c] rise rise-delay-2">Review structured M&A listings, acquisition criteria and private deal conversations through the Buyer, Seller or Manager demo role.</p>
          <div className="mt-8 hidden border-y border-[#d8e1dd] sm:block rise rise-delay-2">
            {marketRows.map((row, index) => <div key={row.label} className="grid gap-1 border-b border-[#e8eeeb] py-3.5 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-5"><p className="text-xs font-bold text-[#17211e]">{String(index + 1).padStart(2, "0")} · {row.label}</p><p className="text-xs leading-5 text-[#6b7873]">{row.detail}</p></div>)}
          </div>
        </div>
        <footer className="relative z-10 hidden flex-wrap items-center justify-between gap-2 border-t border-[#d8e1dd] pt-4 text-[9px] font-bold uppercase tracking-[.08em] text-[#77837e] sm:flex"><span>Seeded review environment</span><span>Buyer · Seller · Manager</span></footer>
      </section>
      <section className="flex items-center border-t border-[#d8e1dd] bg-[#101816] px-6 py-10 text-white sm:px-10 lg:border-l lg:border-t-0 lg:px-11">
        <div className="w-full">
          <p className="text-[10px] font-bold uppercase tracking-[.11em] text-[#8bc2ae]">Reviewer access</p>
          <h2 className="mt-2 text-2xl font-semibold">Sign in to N5Deal</h2>
          <p className="mt-2 text-xs leading-5 text-white/55">Use a seeded identity or your assigned credentials.</p>
          <div className="mt-8"><LoginForm /></div>
          <p className="mt-8 border-t border-white/15 pt-4 text-[11px] leading-5 text-white/45">Role permissions, session security and data access are enforced by the server.</p>
        </div>
      </section>
    </div>
  </main>;
}
