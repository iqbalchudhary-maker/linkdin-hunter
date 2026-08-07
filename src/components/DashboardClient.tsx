"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import HuntForm from "@/components/HuntForm";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Globe, 
  Mail, 
  MessageCircle, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Share2
} from "lucide-react";

interface Lead {
  id: string;
  companyName: string;
  websiteUrl: string | null;
  phoneNumber: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  industry: string;
  country: string;
  aiAnalysis: string | null;
  status: string;
  createdAt: string | Date;
}

interface DashboardClientProps {
  initialNewLeads: Lead[];
  initialSentLeads: Lead[];
}

export default function DashboardClient({ initialNewLeads, initialSentLeads }: DashboardClientProps) {
  const [newLeads, setNewLeads] = useState<Lead[]>(initialNewLeads);
  const [sentLeads, setSentLeads] = useState<Lead[]>(initialSentLeads);
  const [activeTab, setActiveTab] = useState<"new" | "sent">("new");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mark Lead as Sent or Handled
  const handleMarkSent = async (leadId: string) => {
    setLoadingId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/mark-sent`, {
        method: "POST",
      });
      
      if (response.ok) {
        const movedLead = newLeads.find((l) => l.id === leadId);
        if (movedLead) {
          setNewLeads(newLeads.filter((l) => l.id !== leadId));
          setSentLeads([{ ...movedLead, status: "SENT" }, ...sentLeads]);
        }
      } else {
        alert("Status update karne mein masla ho gaya.");
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Lead Handler
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Aap waqai is lead ko delete karna chahte hain?")) return;
    
    setDeletingId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNewLeads(newLeads.filter((l) => l.id !== leadId));
        setSentLeads(sentLeads.filter((l) => l.id !== leadId));
      } else {
        alert("Lead delete karne mein masla ho gaya.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Copy AI Message to Clipboard
  const handleCopyMessage = (lead: Lead) => {
    if (!lead.aiAnalysis) return;
    navigator.clipboard.writeText(lead.aiAnalysis);
    setCopiedId(lead.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Email Click Handler with Validation
  const handleEmailClick = (lead: Lead) => {
    if (!lead.email) {
      alert("Is company ka email address mojood nahi hai.");
      return;
    }

    const subject = encodeURIComponent(`Growth & AI Automation for ${lead.companyName}`);
    const body = encodeURIComponent(lead.aiAnalysis || "");
    const mailtoUrl = `mailto:${lead.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  // WhatsApp Click Handler with Validation
  const handleWhatsAppClick = (lead: Lead) => {
    if (!lead.phoneNumber) {
      alert("Yeh number WhatsApp par registered nahi hai ya mojood nahi hai.");
      return;
    }

    const cleanedPhone = lead.phoneNumber.replace(/[^0-9]/g, "");

    if (cleanedPhone.length < 10) {
      alert(`Ghalat ya namukammal number (${lead.phoneNumber}): Yeh WhatsApp par registered nahi ho sakta.`);
      return;
    }

    const encodedMessage = encodeURIComponent(lead.aiAnalysis || "");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Twitter Click Handler with Validation
  const handleTwitterClick = (lead: Lead) => {
    if (!lead.twitterUrl) {
      alert("Is lead ka Twitter/X profile link mojood nahi hai.");
      return;
    }
    window.open(lead.twitterUrl, "_blank");
  };

  // Instagram Click Handler with Validation
  const handleInstagramClick = (lead: Lead) => {
    if (!lead.instagramUrl) {
      alert("Is lead ka Instagram profile link mojood nahi hai.");
      return;
    }
    window.open(lead.instagramUrl, "_blank");
  };

  // Regenerate AI Message Handler
  const handleRegeneratePitch = async (lead: Lead) => {
    setRegeneratingId(lead.id);
    try {
      const response = await fetch(`/api/leads/${lead.id}/regenerate`, {
        method: "POST",
      });

      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("API returned HTML instead of JSON:", text);
        alert("Server error: Regenerate API route mojood nahi hai ya crash ho gayi hai.");
        return;
      }

      if (response.ok && data.aiAnalysis) {
        const updatedAnalysis = data.aiAnalysis;
        setNewLeads(newLeads.map(l => l.id === lead.id ? { ...l, aiAnalysis: updatedAnalysis } : l));
        setSentLeads(sentLeads.map(l => l.id === lead.id ? { ...l, aiAnalysis: updatedAnalysis } : l));
      } else {
        alert(data.error || "Naya message generate karne mein masla ho gaya.");
      }
    } catch (error) {
      console.error("Regenerate Error:", error);
      alert("Network error ki wajah se message regenerate nahi ho saka.");
    } finally {
      setRegeneratingId(null);
    }
  };

  const currentList = activeTab === "new" ? newLeads : sentLeads;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      {/* 1. Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-blue-400 bg-clip-text text-transparent">
            SM Tech Hunter Console
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Hunt leads, analyze gaps with AI, and send automated outreach emails & messages.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 flex gap-2">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "new" 
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              New Leads ({newLeads.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "sent" 
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sent / Contacted ({sentLeads.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Embedded Lead Hunting Form */}
      <div className="max-w-7xl mx-auto mb-12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 mb-4 text-blue-400 text-sm font-semibold uppercase tracking-wider">
          <Sparkles size={16} /> Start AI Lead Hunting
        </div>
        <HuntForm />
      </div>

      {/* 3. Main Leads Grid / List */}
      <div className="max-w-7xl mx-auto">
        {currentList.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl">
            <Sparkles className="mx-auto text-blue-500 mb-4 animate-bounce" size={40} />
            <h3 className="text-xl font-bold text-gray-300">No leads found in this section</h3>
            <p className="text-gray-500 text-sm mt-1">Use the hunting form above to start extracting and analyzing leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {currentList.map((lead) => {
              return (
                <div 
                  key={lead.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-blue-500/40 transition-all shadow-xl backdrop-blur-sm flex flex-col gap-6"
                >
                  {/* Lead Info & Contact Actions Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl text-blue-400">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-white">{lead.companyName}</h2>
                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                            lead.status === "SENT" 
                              ? "bg-green-500/10 text-green-400 border-green-500/30" 
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5 text-blue-300 font-medium">
                            {lead.industry}
                          </span>
                          <span>•</span>
                          <span>{lead.country}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {new Date(lead.createdAt).toISOString().split('T')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Website, Email, WhatsApp, Twitter, Instagram, Copy, Regenerate, Delete */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {lead.websiteUrl && (
                        <a 
                          href={lead.websiteUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 border border-white/10 transition-colors"
                        >
                          <Globe size={14} className="text-blue-400" /> Website <ExternalLink size={10} />
                        </a>
                      )}

                      {/* Email Button */}
                      <button 
                        onClick={() => handleEmailClick(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 border border-blue-500/20 transition-all"
                      >
                        <Mail size={14} className="text-blue-400" /> Email
                      </button>

                      {/* WhatsApp Button */}
                      <button 
                        onClick={() => handleWhatsAppClick(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-xs font-semibold text-green-300 border border-green-500/20 transition-all"
                      >
                        <MessageCircle size={14} className="text-green-400" /> WhatsApp
                      </button>

                      {/* Twitter Button */}
                      <button 
                        onClick={() => handleTwitterClick(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 border border-sky-500/20 transition-all"
                      >
                        <Share2 size={14} className="text-sky-400" /> Twitter
                      </button>

                      {/* Instagram Button */}
                      <button 
                        onClick={() => handleInstagramClick(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-xs font-semibold text-pink-300 border border-pink-500/20 transition-all"
                      >
                        <Share2 size={14} className="text-pink-400" /> Instagram
                      </button>

                      {/* Copy Message Button */}
                      <button 
                        onClick={() => handleCopyMessage(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 border border-amber-500/20 transition-all"
                        title="Copy AI Pitch"
                      >
                        {copiedId === lead.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />} 
                        {copiedId === lead.id ? "Copied!" : "Copy"}
                      </button>

                      {/* Regenerate Message Button */}
                      <button 
                        onClick={() => handleRegeneratePitch(lead)}
                        disabled={regeneratingId === lead.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-semibold text-purple-300 border border-purple-500/20 transition-all disabled:opacity-50"
                        title="Regenerate Different AI Pitch"
                      >
                        <RefreshCw size={14} className={regeneratingId === lead.id ? "animate-spin" : ""} /> 
                        {regeneratingId === lead.id ? "Generating..." : "Regenerate Message"}
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={deletingId === lead.id}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-300 border border-red-500/20 transition-all"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} /> {deletingId === lead.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* AI Generated Outreach Pitch Section */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                        <Sparkles size={14} /> AI Generated Outreach Pitch
                      </div>
                       
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-sans prose prose-invert max-w-none">
                        <ReactMarkdown>{lead.aiAnalysis || "No AI analysis available for this lead."}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-400">
                      Status: <span className="text-white font-semibold">{lead.status}</span>
                    </div>

                    {activeTab === "new" ? (
                      <Button 
                        onClick={() => handleMarkSent(lead.id)}
                        disabled={loadingId === lead.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
                      >
                        {loadingId === lead.id ? "Updating..." : "Mark as Sent / Contacted"} <Send size={14} className="ml-2" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3.5 py-1.5 rounded-lg font-medium">
                        <CheckCircle2 size={14} /> Outreach Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}