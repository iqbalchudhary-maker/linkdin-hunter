"use client";

import { useState } from "react";
import HuntForm from "@/components/HuntForm";
import SendLeadButton from "@/components/SendLeadButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Globe, Sparkles, RefreshCw, Copy, Check, MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePitchAction, generateAllPitchesAction } from "@/app/actions/generatePitch";

export default function DashboardClient({ initialNewLeads, initialSentLeads }: any) {
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shortCopiedId, setShortCopiedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // --- SMART WHATSAPP CHECK ---
  const isWhatsAppValid = (phone: string) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[()]/g, '').replace(/-/g, '');
    // UAE Mobile Pattern Check
    return /^((\+971|0)?5[024568])/.test(cleanPhone);
  };

  // --- WHATSAPP ACTION ---
  const handleWhatsApp = (lead: any) => {
    const message = `Salam! Hope you're doing well.\n\n${lead.aiAnalysis}\n\nCheck your website preview here: ${lead.websiteUrl}`;
    const cleanPhone = lead.phoneNumber.replace(/\s+/g, '').replace(/[()]/g, '').replace(/-/g, '');
    
    let finalPhone = cleanPhone;
    if (!finalPhone.startsWith('+')) {
      if (finalPhone.startsWith('05')) finalPhone = '971' + finalPhone.substring(1);
      else if (finalPhone.startsWith('5')) finalPhone = '971' + finalPhone;
    }

    const url = `https://wa.me/${finalPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleMarkAsSent = async (id: string) => {
    setMarkingId(id);
    try {
      const response = await fetch(`/api/leads/${id}/mark-sent`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) window.location.reload();
    } catch (error) {
      console.error("Status update fail:", error);
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        if (response.ok) window.location.reload();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const getShortNote = (lead: any) => {
    return `Hi! I've built an AI tool that analyzed ${lead.companyName}'s lead flow. I have a custom audit & screenshot ready. Let's connect!`;
  };

  const handleCopy = (text: string, id: string, type: "full" | "short" = "full") => {
    navigator.clipboard.writeText(text);
    if (type === "short") {
      setShortCopiedId(id);
      setTimeout(() => setShortCopiedId(null), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleBulkGenerate = async () => {
    setLoading(true);
    const res = await generateAllPitchesAction();
    if (res.success) window.location.reload();
    setLoading(false);
  };

  const handleSingleGenerate = async (id: string) => {
    const res = await generatePitchAction(id);
    if (res.success) window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 min-h-screen bg-slate-50/50">
      <div className="flex justify-between items-end border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Ecom-Sniper <span className="text-blue-600">Console</span> 🎯
          </h1>
          <p className="text-slate-500 font-medium">Developed by Ghulam Abbas Bhatti</p>
        </div>
      </div>

      <HuntForm />

      <Tabs defaultValue="hunt" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-100 grid-cols-2 bg-slate-200/50 p-1">
            <TabsTrigger value="hunt" className="font-bold">Target Hunt List ({initialNewLeads.length})</TabsTrigger>
            <TabsTrigger value="sent" className="font-bold">Sent History ({initialSentLeads.length})</TabsTrigger>
          </TabsList>

          <Button onClick={handleBulkGenerate} disabled={loading} variant="outline" className="border-orange-500 text-orange-600 font-bold gap-2 shadow-sm">
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate All Pitches
          </Button>
        </div>

        <TabsContent value="hunt" className="space-y-6">
          {initialNewLeads.map((lead: any) => (
            <div key={lead.id} className="bg-white border-l-4 border-l-blue-600 rounded-xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{lead.companyName}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{lead.industry}</span>
                  </div>
                  <div className="flex gap-6 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Phone size={14}/> {lead.phoneNumber || "No Phone"}</span>
                    {lead.websiteUrl && <a href={lead.websiteUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1.5"><Globe size={14}/> Website</a>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* WHATSAPP: Only for Mobile */}
                    {isWhatsAppValid(lead.phoneNumber) && (
                      <Button size="sm" onClick={() => handleWhatsApp(lead)} className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2">
                        <MessageSquare size={14}/> WhatsApp
                      </Button>
                    )}

                    <Button size="sm" variant="ghost" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                     <Trash2 size={18} />
                    </Button>

                    <Button size="sm" onClick={() => handleMarkAsSent(lead.id)} disabled={markingId === lead.id} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md">
                     {markingId === lead.id ? <RefreshCw className="animate-spin" size={14}/> : <Send size={14}/>}
                     Mark as Sent
                    </Button>

                    <SendLeadButton
                     linkedinUrl={lead.linkedinUrl || `https://www.google.com/search?q=site:linkedin.com/in/ ("${lead.companyName.split(' ')[0]}" OR "${lead.companyName}") (CEO OR Founder OR Owner)`}
                     suggestedMsg={lead.aiAnalysis || ""}
                     leadId={lead.id}
                    />
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleCopy(getShortNote(lead), lead.id, "short")} className="bg-white border-blue-400 text-blue-600 gap-2 font-bold hover:bg-blue-50">
                    {shortCopiedId === lead.id ? <Check size={14} className="text-green-500"/> : <MessageSquare size={14}/>}
                    {shortCopiedId === lead.id ? "Copied!" : "Short Pitch"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(lead.aiAnalysis, lead.id, "full")} className="bg-white border text-blue-600 gap-2 font-bold hover:bg-blue-100">
                    {copiedId === lead.id ? <Check size={14}/> : <Copy size={14}/>}
                    {copiedId === lead.id ? "Copied Full!" : "Full Pitch"}
                  </Button>
                </div>
                <p className="text-[11px] font-bold text-blue-400 uppercase mb-3 tracking-widest">AI LinkedIn Pitch:</p>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium mb-4 pr-20">
                  {lead.aiAnalysis || "No pitch generated yet."}
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Website Preview:</p>
                  <img 
                    src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(lead.websiteUrl || "google.com")}?w=400&h=250`} 
                    alt="Preview" 
                    className="rounded-lg border shadow-sm w-full max-w-sm bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          {initialSentLeads.map((lead: any) => (
              <div key={lead.id} className="bg-white border-l-4 border-l-emerald-500 rounded-xl p-6 shadow-sm mb-4">
                 <h3 className="font-bold">{lead.companyName} ✅</h3>
                 <p className="text-xs text-slate-500">{lead.industry}</p>
              </div>
           ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}