"use client";
import { useState } from "react";
import { scrapeLeads } from "@/app/actions/scrapeLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HuntForm() {
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");

  const handleHunt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !country) return alert("Please fill both fields");

    setLoading(true);
    const result = await scrapeLeads(industry, country);
    setLoading(false);

    if (result.success) {
      alert(result.message);
      window.location.reload(); // Data refresh karne ke liye
    } else {
      alert("Error hunting leads!");
    }
  };

  return (
    <form onSubmit={handleHunt} className="flex gap-4 p-4 bg-white shadow-sm rounded-xl border">
      <Input 
        placeholder="Industry (e.g. Solar)" 
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        className="w-full"
      />
      <Input 
        placeholder="Country (e.g. UAE)" 
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full"
      />
      <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-30">
        {loading ? "Hunting... 🎯" : "Start Hunting"}
      </Button>
    </form>
  );
}