"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";

export async function scrapeLeads(industryOrCompany: string, countryOrCity: string) {
  try {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) return { success: false, message: "System Error: API Key missing!" };

    const searchQuery = `${industryOrCompany.trim()} in ${countryOrCity.trim()}`;
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return { success: false, message: "API Error: " + data.error };

    const results = data.local_results || [];
    if (results.length === 0) return { success: false, message: "No leads found. Try a specific city." };

    let count = 0;
    for (const biz of results) {
      if (!biz.website) continue; // Screenshot aur analysis ke liye website lazmi hai

      // ✅ Expert Check: Duplicate by Website URL or Name
      const exists = await prisma.lead.findFirst({
        where: {
          OR: [
            { companyName: biz.title },
            { websiteUrl: biz.website }
          ]
        }
      });

      if (exists) {
        console.log(`⏩ Skipping ${biz.title} - Already in database.`);
        continue;
      }

      // AI Analysis - Logic to handle potential AI errors gracefully
      let pitch = "Analysis Pending";
      try {
        pitch = await analyzeWebsite(`Business: ${biz.title}. Category: ${biz.type}. Location: ${countryOrCity}. Website: ${biz.website}`);
      } catch (aiErr) {
        console.error("AI skip for this lead, saving as pending.");
      }

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
      if (count >= 10) break; // Limit to 10 quality leads per hunt
    }

    return { success: true, message: `Success! ${count} unique leads captured for SM Technology.` };

  } catch (error: any) {
    console.error("❌ Fatal Error:", error.message);
    return { success: false, message: "Hunting failed!" };
  }
}