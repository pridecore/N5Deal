export default function LoadingBuyers() {
  return <div className="deal-shell min-h-screen animate-pulse"><div className="h-20 max-w-[560px] bg-[#e5ece8]" /><div className="mt-6 h-16 border border-[#d8e1dd] bg-white" /><div className="mt-5 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 border border-[#d8e1dd] bg-white" />)}</div></div>;
}
