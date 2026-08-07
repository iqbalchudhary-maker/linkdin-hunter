"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";

export async function scrapeInstagramLeads(industryOrNiche: string, countryOrCity: string) {
  try {
    const serpApiKey = process.env.SERP_API_KEY;
    if (!serpApiKey) {
      return { success: false, message: "System Error: SERP_API_KEY is missing in environment variables!" };
    }

    if (!industryOrNiche || !countryOrCity) {
      return { success: false, message: "Industry/Niche and Country/City are required fields." };
    }

    const cleanIndustry = industryOrNiche.trim();
    const cleanLocation = countryOrCity.trim();

    const query = `site:instagram.com "${cleanIndustry}" "${cleanLocation}"`;
    const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=40`;

    console.log(`📸 Hunting Instagram leads via query: ${query}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      return { success: false, message: "API Error: " + data.error };
    }

    const results = data.organic_results || [];
    if (results.length === 0) {
      return { success: false, message: "No Instagram profiles found for this query." };
    }

    let newLeadsCount = 0;

    // Loop through all results safely using 'for...of' instead of breaking the flow
    for (const item of results) {
      const profileUrl = item.link || "";
      if (!profileUrl.includes("instagram.com/") || profileUrl.includes("/p/") || profileUrl.includes("/reel/")) {
        continue;
      }

      let profileTitle = item.title || "Instagram Business";
      profileTitle = profileTitle.replace(/ - Instagram photos and videos.*$/, "").trim();
      const snippet = (item.snippet || "").toLowerCase();

      let extractedPhone = "No Phone";
      const phoneMatch = snippet.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        extractedPhone = phoneMatch[0];
      }

      let extractedEmail = null;
      const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        extractedEmail = emailMatch[0];
      }

      // Check if profile already exists globally
      const exists = await prisma.lead.findFirst({
        where: {
          OR: [
            { companyName: { equals: profileTitle, mode: 'insensitive' } },
            ...(extractedPhone !== "No Phone" ? [{ phoneNumber: extractedPhone }] : [])
          ]
        }
      });

      // Skip only this duplicate and proceed to the next profile
      if (exists) {
        console.log(`⚠️ Skipped existing Instagram profile, moving to next: ${profileTitle}`);
        continue;
      }

      const leadContext = `
        Instagram Profile: ${profileTitle}
        Profile URL: ${profileUrl}
        Niche: ${cleanIndustry}
        Location: ${cleanLocation}
        Snippet/Bio Info: ${item.snippet || "None"}
        Email: ${extractedEmail || "Not found"}
        Phone: ${extractedPhone}
      `;

      let pitch = "Instagram Profile Analysis";
      try {
        pitch = await analyzeWebsite(leadContext);
      } catch (aiErr) {
        console.error("AI analysis skipped for Instagram lead:", profileTitle);
      }

      try {
        await prisma.lead.create({
          data: {
            companyName: profileTitle,
            websiteUrl: profileUrl,
            phoneNumber: extractedPhone,
            email: extractedEmail,
            instagramUrl: profileUrl,
            industry: `${cleanIndustry} (Target: Instagram Profile)`,
            country: cleanLocation,
            aiAnalysis: pitch,
            status: "NEW",
          },
        });
        newLeadsCount++;
      } catch (dbErr) {
        console.error("Database insert error for Instagram profile:", profileTitle, dbErr);
      }
    }

    if (newLeadsCount === 0) {
      return { success: false, message: "All fetched Instagram leads already exist in your database!" };
    }

    return { success: true, message: `Success! ${newLeadsCount} new Instagram business leads captured successfully.` };

  } catch (error: any) {
    console.error("❌ Fatal Instagram Scraping Error:", error.message);
    return { success: false, message: "Instagram lead hunting failed due to an unexpected error." };
  }
}