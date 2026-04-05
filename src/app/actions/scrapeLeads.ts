"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";

export async function scrapeLeads(industryOrCompany: string, countryOrCity: string) {
  try {
    const apiKey = process.env.SERP_API_KEY;
    console.log("🔑 Checking API Key:", apiKey ? "Found ✅" : "NOT FOUND ❌");

    if (!apiKey) {
      return { success: false, message: "System Error: API Key missing in Server!" };
    }

    const searchQuery = `${industryOrCompany.trim()} in ${countryOrCity.trim()}`;
    console.log("🎯 Targeting:", searchQuery);

    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ SerpApi Error:", data.error);
      return { success: false, message: "API Error: " + data.error };
    }

    const results = data.local_results || [];
    console.log("📊 Leads Found by Google:", results.length);

    if (results.length === 0) {
      return { success: false, message: "No leads found. Try a specific city like 'Dubai' or 'New York'." };
    }

    let count = 0;
    for (const biz of results.slice(0, 15)) {
      
      // ✅ Check: Agar website nahi hai toh hunt nahi karna
      if (!biz.website) {
        console.log(`🚫 Skipping ${biz.title} - No website for screenshot.`);
        continue; 
      }

      // Duplicate check
      const exists = await prisma.lead.findFirst({ where: { companyName: biz.title } });
      if (exists) continue;

      // AI Analysis
      const pitch = await analyzeWebsite(`Business: ${biz.title}. Category: ${biz.type}. Location: ${countryOrCity}`);

      await prisma.lead.create({
        data: {
          companyName: biz.title,
          websiteUrl: biz.website,
          phoneNumber: biz.phone || "No Phone",
          industry: industryOrCompany,
          country: countryOrCity,
          aiAnalysis: pitch,
          status: "NEW",
        },
      });
      count++;

      if (count >= 10) break;
    }

    return { success: true, message: `Boom! ${count} new leads with websites captured.` };

  } catch (error: any) {
    console.error("❌ Fatal Error:", error.message);
    return { success: false, message: "Hunting failed!" };
  }
}