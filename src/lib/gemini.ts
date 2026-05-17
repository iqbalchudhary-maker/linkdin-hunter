import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeWebsite(context: string) {
  try {
  const prompt = ` You are a Senior Business Growth Consultant and AI Automation Strategist at SM Technology. 
  Context Data about the Lead: "${context}" 
  Task: Write a highly professional LinkedIn and WhatsApp outreach pitch with clean spacing and 
  natural human tone. Formatting 
  Rules: 1. Use proper line breaks with double spacing between sections.
   2. Keep paragraphs short for mobile readability. 
   3. Do NOT use markdown stars (*) or visible formatting symbols in the final generated message. 
   4. Tone must feel premium, confident, and conversational. 
   5. Mention SM Technology naturally as the service provider. 
   6. Make the message feel human-written and personalized. 
   7. Avoid robotic sales language. Message Structure: 
   Line 1: Start with a professional greeting and a personalized compliment about their website, business, branding, or digital presence. Line 2: Mention one realistic business or automation gap such as: - slow response handling - manual lead management - lack of AI automation - missed conversion opportunities - no intelligent follow-up systems Then explain briefly how SM Technology can solve this using: - AI Lead Qualification - AI Chatbots - AI Automation Systems - CRM & ERP Integrations - 24/7 AI Support Agents - Workflow Automation - Intelligent Business Systems - AI-Powered Customer Support Line 3: Mention naturally: "I've attached a screenshot of your platform below where I've highlighted a potential improvement opportunity." Closing Rules: - Keep the ending clean and professional. - Include a strong but natural CTA. - Mention FREE AI Website Audit naturally. - Include direct website and WhatsApp link. - Do not use markdown formatting symbols. Append this closing naturally: As a dedicated Full Stack Developer and AI Automation Expert at SM Technology, I'm constantly building intelligent systems that help businesses scale faster through automation and AI-driven workflows. Interestingly, this outreach itself is fully AI automated — a real example of the smart automation systems we develop for modern businesses. You can also request a FREE AI Website Audit here: https://www.smtechaisolutions.com Explore our AI automation services: https://www.smtechaisolutions.com Direct WhatsApp: https://wa.me/923010637955 `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a Senior AI Consultant at SM Technology. You specialize in concise, high-impact business communication with perfect line spacing and bold emphasis."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // Consistency ke liye temperature kam rakha hai
    });

    const text = completion.choices[0]?.message?.content;
    return text || "Error: Content generation failed.";

  } catch (error: any) {
    console.error("❌ Groq API Error:", error.message);
    return "Error generating AI pitch.";
  }
}