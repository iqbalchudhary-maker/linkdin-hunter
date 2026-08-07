import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Zap, Shield, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Header / Brand */}
      <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group">
          <div className="bg-blue-600 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Target className="text-white" size={26} />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">SM TECH <span className="text-blue-500">LEAD HUNTER</span></span>
            <span className="block text-[10px] text-gray-400 tracking-widest uppercase">Powered by SM Technology</span>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Architect & Developer</p>
          <p className="text-sm font-semibold text-blue-400">Ghulam Abbas Bhatti</p>
          <p className="text-[10px] text-gray-500">AI Automation Expert | SM Technology</p>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-8 animate-pulse">
          <Zap size={14} /> SM Technology AI Intelligence Online
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-linear-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
          Hunt Elite Business Leads. <br /> 
          <span className="text-blue-500">Close High-Ticket Clients on Autopilot.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          An advanced multi-source intelligence engine built by <strong className="text-white">SM Technology</strong>. Discover decision-makers, analyze business gaps with AI, and scale your outreach instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95">
              Launch Hunter Console <Rocket className="ml-2" size={20} />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left">
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <Target className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Multi-Source Intelligence</h3>
            <p className="text-gray-400 text-sm">Extract verified company data, cell numbers, and decision-maker insights seamlessly.</p>
          </div>
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <Zap className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">AI-Powered Pitches</h3>
            <p className="text-gray-400 text-sm">Leverage high-speed AI analysis to uncover business pain points and generate custom pitches.</p>
          </div>
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-blue-500/50 transition-all hover:-translate-y-1">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Smart CRM & Memory</h3>
            <p className="text-gray-400 text-sm">Track lead interactions, status changes, and conversation history with absolute precision.</p>
          </div>
        </div>
      </main>

      {/* Footer for Mobile & Desktop */}
      <footer className="text-center pb-12 px-6 border-t border-white/5 pt-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
        <p>© 2026 SM Technology. All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          Crafted with excellence by <span className="text-blue-400 font-medium">Ghulam Abbas Bhatti</span>
        </p>
      </footer>
    </div>
  );
}