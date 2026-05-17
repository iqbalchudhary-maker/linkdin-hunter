"use server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function generatePitchAction(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { success: false, message: "Lead not found" };

    const context = `Business: ${lead.companyName}. Industry: ${lead.industry}. Location: ${lead.country}. Website: ${lead.websiteUrl}`;
    const pitch = await analyzeWebsite(context);

    if (!pitch || pitch.includes("Error")) {
      return { success: false, message: "AI Analysis failed." };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { aiAnalysis: pitch }
    });

    revalidatePath("/dashboard");
    return { success: true, pitch };
  } catch (error: any) {
    return { success: false, message: "AI Error: " + error.message };
  }
}

export async function generateAllPitchesAction() {
  try {
    const leadsWithoutPitches = await prisma.lead.findMany({
      where: {
        OR: [
          { aiAnalysis: { contains: "Error" } },
          { aiAnalysis: { contains: "Pending" } },
          { aiAnalysis: "" },
          { aiAnalysis: null }
        ]
      }
    });

    for (const lead of leadsWithoutPitches) {
      const context = `Business: ${lead.companyName}. Industry: ${lead.industry}. Location: ${lead.country}. Website: ${lead.websiteUrl}`;
      const pitch = await analyzeWebsite(context);
      
      await prisma.lead.update({
        where: { id: lead.id },
        data: { aiAnalysis: pitch }
      });
      // Small delay to prevent API rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    revalidatePath("/dashboard");
    return { success: true, message: `${leadsWithoutPitches.length} pitches processed!` };
  } catch (error) {
    return { success: false, message: "Bulk AI Processing Error" };
  }
}