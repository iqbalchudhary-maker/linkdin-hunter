import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function analyzeWebsite(context: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Gemini API Key missing!");
      return "Error: Gemini API key not found.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ Safety Settings added to prevent empty/error responses
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `
  You are a Senior Business Growth Consultant and AI Automation Strategist.
  Context Data about the Lead: "${context}"
  
  Task: Write a highly professional LinkedIn pitch with clear spacing.

  Format Rules:
  1. Use clear line breaks (Double Enter) between sections.
  2. Line 1: Professional greeting and a specific compliment about their brand/website.
  3. Line 2: A specific observation about a digital bottleneck and how your AI solution fixes it.
  4. Line 3: Mention: "I've attached a screenshot of your platform below where I've highlighted this specific area for improvement."

  CRITICAL: Append this EXACT signature at the end:

  "As a dedicated Full Stack Developer and AI Automation Expert, I'm constantly building solutions that drive efficiency. 
  
  Guess what? This very message is 100% automated! It's living proof of my AI skills in action. I've even attached a screenshot of your platform to show you exactly where we can optimize.

  Explore my work here: [https://your-vercel-portfolio.vercel.app]
  Reach out directly on WhatsApp: +923010637955"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || "Error: Gemini returned empty text.";

  } catch (error: any) {
    console.error("❌ Gemini API Error:", error.message);
    return "Error generating AI pitch. Please check your Gemini API key.";
  }
}