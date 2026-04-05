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
        <div className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Target className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tighter">ECOM-SNIPER</span>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Developed By</p>
          <p className="text-sm font-semibold text-blue-400">Ghulam Abbas Bhatti</p>
          <p className="text-[10px] text-gray-500">AI Automation Expert & Full Stack Developer</p>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-medium mb-8 animate-pulse">
          <Zap size={14} /> System Online: AI Hunting Ready
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-b from-white to-gray-500 bg-clip-text text-transparent">
          Hunt Leads. Close Deals. <br /> 
          <span className="text-blue-500">Automate Everything.</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          The ultimate AI-powered lead generation engine. Find high-ticket clients, 
          analyze their gaps with Gemini AI, and send personalized pitches in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
              Launch Hunter Console <Rocket className="ml-2" size={20} />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
          <div className="p-8 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
            <Target className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Deep Scraping</h3>
            <p className="text-gray-500 text-sm">Target any industry in any country with Google Maps integration.</p>
          </div>
          <div className="p-8 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
            <Zap className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-500 text-sm">Powered by Gemini 1.5 Flash to find business pain points instantly.</p>
          </div>
          <div className="p-8 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Safe Delivery</h3>
            <p className="text-gray-500 text-sm">Semi-automated workflow to protect your LinkedIn account from bans.</p>
          </div>
        </div>
      </main>

      {/* Footer for Mobile */}
      <footer className="md:hidden text-center pb-10 px-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Developed By</p>
        <p className="text-sm font-semibold text-blue-400">Ghulam Abbas Bhatti</p>
      </footer>
    </div>
  );
}