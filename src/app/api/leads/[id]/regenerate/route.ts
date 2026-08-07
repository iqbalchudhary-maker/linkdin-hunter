import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const leadId = params.id;

    // 1. Lead database se find karein
    const lead = await db.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead nahi mili." }, { status: 404 });
    }

    // 2. Detailed professional prompt for SM Technology AI Automation
    const prompt = `You are an expert AI Automation and Full-Stack Developer consultant from SM Technology. 
    Write a highly engaging, professional, and persuasive outreach message for the company "${lead.companyName}" which operates in the "${lead.industry}" industry (Website: ${lead.websiteUrl || 'N/A'}).
    Focus specifically on custom AI chatbots, workflow automation, and high-conversion web systems. Keep it concise, engaging, and ready to send as an email or WhatsApp message. Do not use generic filler text.`;

    // 3. Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY environment variable missing hai.");
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Aapke project mein jo Groq ka model use ho raha ho
        messages: [
          { role: "system", content: "You are an expert sales copywriter and AI automation consultant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const groqData = await groqResponse.json();
    
    if (!groqResponse.ok) {
      throw new Error(groqData.error?.message || "Groq API request fail ho gayi.");
    }

    const newAnalysis = groqData.choices?.[0]?.message?.content || "Hello! We noticed your amazing work at " + lead.companyName + " and wanted to discuss custom AI automation solutions.";

    // 4. Database mein update karein
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: { aiAnalysis: newAnalysis },
    });

    return NextResponse.json({ success: true, aiAnalysis: updatedLead.aiAnalysis });
  } catch (error: any) {
    console.error("Regenerate API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}