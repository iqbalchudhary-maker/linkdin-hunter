import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeWebsite(context: string) {
  try {
    const prompt = `You are a Senior Business Growth Consultant and AI Automation Strategist at SM Technology. 

Context Data about the Lead / Company: "${context}" 

Task: Write a highly professional, structured, and punchy outreach message (suitable for LinkedIn and WhatsApp) with clean spacing, natural human tone, and **bold headings** for key sections to ensure maximum readability.

Formatting & Structural Rules:
1. Use bold headings (using markdown asterisks like **Heading**) for important sections so they stand out clearly.
2. Keep paragraphs short and crisp for mobile readability.
3. Tone must feel premium, confident, conversational, and completely non-robotic.
4. Naturally integrate the company name/website from the context into the opening compliment.

Message Structure:
- **Opening:** Start with a professional greeting and a personalized compliment about their digital presence, brand, or business based on the context data.
- **The Core Opportunity / Gap:** Mention a realistic business or automation gap (such as slow response handling, manual lead management, or missed conversion opportunities).
- **The Solution by SM Technology:** Briefly explain how SM Technology bridges this gap using tools like AI Lead Qualification, AI Chatbots, CRM & ERP Integrations, and 24/7 AI Support Agents.
- **Platform Reference:** Include this line naturally: "I've attached a screenshot of your platform below where I've highlighted a potential improvement opportunity."
- **Closing & Credentials (Mandatory Format):**
  Append this exact closing section cleanly with bold elements and links:

**About SM Technology & Next Steps**
As a dedicated Full Stack Developer and AI Automation Expert at SM Technology, I'm constantly building intelligent systems that help businesses scale faster through automation and AI-driven workflows. Interestingly, this outreach itself is fully AI automated — a real example of the smart automation systems we develop for modern businesses.

**Important Links & Actions:**
- **Request a FREE AI Website Audit:** https://www.smtechaisolutions.com
- **Explore Our AI Services:** https://www.smtechaisolutions.com
- **Direct WhatsApp Chat:** https://wa.me/923010637955`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a Senior AI Consultant at SM Technology. You specialize in concise, high-impact business communication with clean formatting, bold headings, and professional structure."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
    });

    const text = completion.choices[0]?.message?.content;
    return text || "Error: Content generation failed.";

  } catch (error: any) {
    console.error("❌ Groq API Error:", error.message);
    return "Error generating AI pitch.";
  }
}