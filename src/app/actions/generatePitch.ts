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

    const mapsQuery = `${enhancedIndustryQuery} in ${cleanLocation} (major cities, regions, and provinces)`;
    const mapsUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(mapsQuery)}&api_key=${serpApiKey}`;

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

    const leadPromises = results.map(async (biz: any) => {
      if (!biz.website) return;

      const bizPhone = biz.phone ? biz.phone.trim() : null;

      // Duplicate check: Checks ONLY companyName or phoneNumber globally (ignoring industry/country)
      const exists = await prisma.lead.findFirst({
        where: {
          OR: [
            { companyName: { equals: biz.title, mode: 'insensitive' } },
            ...(bizPhone && bizPhone !== "No Phone" ? [{ phoneNumber: bizPhone }] : [])
          ]
        }
      });

      if (exists) {
        return;
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

      await prisma.lead.create({
        data: {
          companyName: biz.title,
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
    });

    await Promise.all(leadPromises);

    if (newLeadsCount === 0) {
      return { success: false, message: "Fetched leads already exist in your database!" };
    }

    return { success: true, message: `Success! ${newLeadsCount} high-value leads captured smoothly.` };

  } catch (error: any) {
    console.error("❌ Fatal Scraping Error:", error.message);
    return { success: false, message: "Lead hunting failed due to an unexpected error." };
  }
}