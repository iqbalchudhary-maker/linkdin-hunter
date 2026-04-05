"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function generatePitchAction(leadId: string) {
  console.log(`🚀 Starting individual pitch generation for ID: ${leadId}`);
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    
    if (!lead) {
      console.error("❌ Lead not found in database");
      return { success: false, message: "Lead not found" };
    }

    console.log(`🤖 Requesting AI for: ${lead.companyName}`);
    
    // ✅ Stronger Context for Gemini
    const context = `Business Name: ${lead.companyName}. Industry: ${lead.industry}. Location: ${lead.country}. Website: ${lead.websiteUrl}`;
    const pitch = await analyzeWebsite(context);

    if (!pitch || pitch.includes("Error")) {
      console.error("❌ Gemini returned an empty or error pitch");
      return { success: false, message: "AI returned error, check terminal." };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { aiAnalysis: pitch }
    });

    console.log(`✅ Success! Pitch updated for ${lead.companyName}`);
    
    revalidatePath("/dashboard");
    return { success: true, pitch };
  } catch (error: any) {
    console.error("❌ Individual AI Action Error:", error.message);
    return { success: false, message: "AI Error: " + error.message };
  }
}

export async function generateAllPitchesAction() {
  console.log("🚀 Starting Bulk Pitch Generation...");
  try {
    const leadsWithoutPitches = await prisma.lead.findMany({
      where: {
        OR: [
          { aiAnalysis: { contains: "Error" } },
          { aiAnalysis: "" },
          { aiAnalysis: null }
        ]
      }
    });

    console.log(`📊 Found ${leadsWithoutPitches.length} leads needing update.`);

    for (const lead of leadsWithoutPitches) {
      console.log(`🔄 Generating: ${lead.companyName}`);
      const context = `Business: ${lead.companyName}. Industry: ${lead.industry}. Location: ${lead.country}. Website: ${lead.websiteUrl}`;
      const pitch = await analyzeWebsite(context);
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { aiAnalysis: pitch }
      });
    }

    console.log("🏁 Bulk generation done.");
    revalidatePath("/dashboard");
    
    return { success: true, message: `${leadsWithoutPitches.length} pitches updated!` };
  } catch (error) {
    return { success: false, message: "Bulk AI Error" };
  }
}