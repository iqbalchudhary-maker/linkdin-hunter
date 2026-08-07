"use client";
import { useState } from "react";
import { scrapeLeads } from "@/app/actions/scrapeLeads";
import { scrapeInstagramLeads } from "@/app/actions/scrapeInstagramLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Globe, Camera, Loader2, MapPin, Building2, Zap, ShieldCheck } from "lucide-react";

export default function HuntForm() {
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("google");

  const handleHunt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim() || !country.trim()) {
      return alert("Please enter both industry and country/region!");
    }

    setLoading(true);
    try {
      let result;
      if (source === "google") {
        result = await scrapeLeads(industry.trim(), country.trim());
      } else {
        result = await scrapeInstagramLeads(industry.trim(), country.trim());
      }

      if (result?.success) {
        alert(result.message || "Leads successfully hunted!");
        window.location.reload();
      } else {
        alert(result?.message || "Error hunting leads! Please try again.");
      }
    } catch (error) {
      console.error("Hunt error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-950/80 backdrop-blur-2xl border border-slate-800/80 rounded-[2rem] p-8 md:p-10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.15)] relative overflow-hidden transition-all duration-500">
      
      {/* Background Ambient Glow Effects */}
      <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-700 ${
        source === "google" ? "bg-indigo-600" : "bg-fuchsia-600"
      }`} />
      <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-700 ${
        source === "google" ? "bg-cyan-600" : "bg-pink-600"
      }`} />

      {/* Top Header Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all duration-500 shadow-lg ${
            source === "google" 
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-indigo-500/10" 
              : "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400 shadow-fuchsia-500/10"
          }`}>
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-lg tracking-tight">AI Lead Engine</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> v2.0 Active
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Automated high-conversion intelligence hunting pipeline</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="self-start sm:self-auto flex items-center px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 shadow-inner">
          <span className={`w-2 h-2 rounded-full mr-2 animate-ping ${source === "google" ? "bg-indigo-400" : "bg-fuchsia-400"}`} />
          <span>{source === "google" ? "Google Maps Engine" : "Instagram Crawler"}</span>
        </div>
      </div>

      <form onSubmit={handleHunt} className="relative z-10 space-y-6">
        
       {/* Source Selector */}
<div className="space-y-3">
  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/20">
      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
    </div>

    Lead Source Platform
  </label>

  <div className="relative group">

    {/* Glow */}
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 blur-md transition-all duration-500 group-hover:opacity-60 group-focus-within:opacity-80" />

    <select
      value={source}
      onChange={(e) => setSource(e.target.value)}
      disabled={loading}
      className="
      relative
      h-16
      w-full
      appearance-none
      rounded-2xl
      border
      border-white/10
      bg-slate-950/90
      backdrop-blur-xl
      px-6
      pr-16
      text-[15px]
      font-semibold
      text-white
      shadow-[0_20px_40px_rgba(0,0,0,.35)]
      transition-all
      duration-300
      outline-none
      hover:border-indigo-400/40
      hover:bg-slate-900
      focus:border-indigo-500
      focus:ring-4
      focus:ring-indigo-500/20
      disabled:cursor-not-allowed
      disabled:opacity-60
      "
    >
      <option value="google">
        🔍 Google Maps & Web Search
      </option>

      <option value="instagram">
        📸 Instagram Business Profiles
      </option>
    </select>

    {/* Left Icon */}
    <div className="absolute left-5 top-1/2 -translate-y-1/2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
          source === "google"
            ? "bg-indigo-500/15 text-indigo-400"
            : "bg-fuchsia-500/15 text-fuchsia-400"
        }`}
      >
        {source === "google" ? (
          <Globe className="h-5 w-5" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
      </div>
    </div>

    {/* Right Arrow */}
    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:rotate-180"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    {/* Status Badge */}
    <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 hidden lg:flex">
      <span
        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
          source === "google"
            ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
            : "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20"
        }`}
      >
        {source === "google" ? "Google" : "Instagram"}
      </span>
    </div>
  </div>
</div>
        {/* Inputs Grid (Industry & Country) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Target Industry / Niche
            </label>
            <Input 
              placeholder="e.g. Real Estate, Solar, AI Agency" 
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-14 bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 rounded-2xl px-5 text-sm transition-all shadow-inner"
              disabled={loading}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-fuchsia-400" /> Target Country / Region
            </label>
            <Input 
              placeholder="e.g. Dubai, Qatar, Australia, London" 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-14 bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 rounded-2xl px-5 text-sm transition-all shadow-inner"
              disabled={loading}
            />
          </div>

        </div>

        {/* Submit Action Button */}
        <div className="pt-3">
          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-14 font-bold text-sm tracking-wide rounded-2xl shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 transform active:scale-[0.98] ${
              source === "google" 
                ? "bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 border border-indigo-400/30" 
                : "bg-linear-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white shadow-fuchsia-600/30 border border-fuchsia-400/30"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Hunting & AI Analyzing Leads... Please wait</span>
              </span>
            ) : source === "google" ? (
              <>
                <Globe className="w-5 h-5" />
                <span>Initialize Google & Maps Hunt</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Initialize Instagram Bulk Hunt</span>
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}