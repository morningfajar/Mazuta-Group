import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
let ai: GoogleGenAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const generateCreativeBrief = async (title: string, brand: string, pic: string): Promise<string[]> => {
  if (!ai) {
    console.warn("Gemini API key not found. Returning mock data.");
    return [
      "Draft initial concepts (Mock)",
      "Review brand guidelines (Mock)",
      "Create high-fidelity mockup (Mock)",
      "Finalize export assets (Mock)"
    ];
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a creative director assistant. 
      I have a task titled "${title}" for the brand "${brand}" assigned to "${pic}".
      Generate a checklist of 4-6 specific, actionable subtasks for a creative designer to complete this request efficiently.
      Return only the list of subtasks as a JSON array of strings. Do not include markdown formatting like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const subtasks = JSON.parse(text);
    return Array.isArray(subtasks) ? subtasks : [];

  } catch (error) {
    console.error("Error generating creative brief:", error);
    return ["Review Requirements", "Brainstorm Concepts", "Execute Design", "Quality Check"];
  }
};