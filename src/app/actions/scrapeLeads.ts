"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";

export async function scrapeLeads(industryOrCompany: string, countryOrCity: string) {
  try {
    const serpApiKey = process.env.SERP_API_KEY;
    if (!serpApiKey) {
      return { success: false, message: "System Error: SERP_API_KEY is missing in environment variables!" };
    }

    if (!industryOrCompany || !countryOrCity) {
      return { success: false, message: "Industry/Niche and Country/City are required fields." };
    }

    const cleanIndustry = industryOrCompany.trim();
    const cleanLocation = countryOrCity.trim();

    let enhancedIndustryQuery = cleanIndustry;
    const lowerInd = cleanIndustry.toLowerCase();
    if (lowerInd.endsWith("s") && !lowerInd.endsWith("ss")) {
      const singular = cleanIndustry.slice(0, -1);
      enhancedIndustryQuery = `(${cleanIndustry} OR ${singular})`;
    } else {
      enhancedIndustryQuery = `(${cleanIndustry} OR ${cleanIndustry}s)`;
    }

    const randomOffset = Math.floor(Math.random() * 5) * 20; 
    const mapsQuery = `${enhancedIndustryQuery} in ${cleanLocation}`;
    const mapsUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(mapsQuery)}&start=${randomOffset}&api_key=${serpApiKey}`;

    console.log(`🔍 Hunting leads via Google Maps & Web Search for: ${mapsQuery}`);

    const response = await fetch(mapsUrl);
    const data = await response.json();

    if (data.error) {
      return { success: false, message: "API Error: " + data.error };
    }

    const results = data.local_results || [];
    if (results.length === 0) {
      return { success: false, message: "No leads found. Try a more specific location or industry." };
    }

    let newLeadsCount = 0;

    // Loop through all fetched results securely without stopping early
    for (const biz of results) {
      if (!biz.website || !biz.title) continue;

      const bizPhone = biz.phone ? biz.phone.trim() : null;

      // Check if this specific company or phone already exists
      const exists = await prisma.lead.findFirst({
        where: {
          OR: [
            { companyName: { equals: biz.title.trim(), mode: 'insensitive' } },
            ...(bizPhone && bizPhone !== "No Phone" ? [{ phoneNumber: bizPhone }] : [])
          ]
        }
      });

      // If it exists, skip ONLY this company and move to the next one in the loop
      if (exists) {
        console.log(`⚠️ Skipped existing company, moving to next: ${biz.title}`);
        continue; 
      }

      let extractedEmail = biz.email || null;
      let extractedInstagram = biz.instagramUrl || null;
      let extractedTwitter = biz.twitterUrl || null;

      try {
        const socialSearchQuery = `"${biz.title}" site:instagram.com OR site:twitter.com OR site:x.com OR contact email`;
        const socialSearchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(socialSearchQuery)}&api_key=${serpApiKey}&num=5`;
        
        const socialRes = await fetch(socialSearchUrl);
        const socialData = await socialRes.json();

        if (socialData.organic_results) {
          for (const resItem of socialData.organic_results) {
            const link = resItem.link || "";
            const snippet = (resItem.snippet || "").toLowerCase();

            if (!extractedInstagram && (link.includes("instagram.com/") && !link.includes("/p/"))) {
              extractedInstagram = link;
            }
            if (!extractedTwitter && (link.includes("twitter.com/") || link.includes("x.com/"))) {
              extractedTwitter = link;
            }
            if (!extractedEmail) {
              const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (emailMatch) {
                extractedEmail = emailMatch[0];
              }
            }
          }
        }
      } catch (searchErr) {
        console.error("⚠️ Social/Email web search failed for:", biz.title);
      }

      const leadContext = `
        Business Name: ${biz.title}
        Category/Type: ${biz.type || cleanIndustry}
        Location: ${cleanLocation}
        Website: ${biz.website}
        Phone: ${bizPhone || "No Phone"}
        Email: ${extractedEmail || "Not found"}
        Instagram: ${extractedInstagram || "Not found"}
        Twitter: ${extractedTwitter || "Not found"}
      `;

      let pitch = "Analysis Pending";
      try {
        pitch = await analyzeWebsite(leadContext);
      } catch (aiErr) {
        console.error("AI analysis skipped for lead:", biz.title);
      }

      try {
        await prisma.lead.create({
          data: {
            companyName: biz.title.trim(),
            websiteUrl: biz.website,
            phoneNumber: bizPhone || "No Phone",
            email: extractedEmail,
            instagramUrl: extractedInstagram,
            twitterUrl: extractedTwitter,
            industry: `${cleanIndustry} (Target: CEO/Director/Manager)`,
            country: cleanLocation,
            aiAnalysis: pitch,
            status: "NEW",
          },
        });
        newLeadsCount++;
      } catch (dbErr) {
        console.error("Database insert error for:", biz.title, dbErr);
      }
    }

    if (newLeadsCount === 0) {
      return { success: false, message: "All fetched leads already exist in your database!" };
    }

    return { success: true, message: `Success! ${newLeadsCount} new leads captured smoothly while skipping duplicates.` };

  } catch (error: any) {
    console.error("❌ Fatal Scraping Error:", error.message);
    return { success: false, message: "Lead hunting failed due to an unexpected error." };
  }
}