
import { GoogleGenAI } from "@google/genai";
import { SimulationResult, AIAnalysis } from "../types";

export const getAIAnalysis = async (result: SimulationResult): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const duration = result.monthlyData.length - 1;
  
  const prompt = `
    Task: Act as a senior precious metals analyst. 
    Analyze this ${duration}-month Gold DCA simulation:
    - Initial Entry: $${(result.monthlyData[0]?.amountInvested || 0).toFixed(0)}
    - Monthly Contribution: $${(result.monthlyData[1]?.amountInvested || 0).toFixed(0)}
    - Total Duration: ${duration} months
    - Average Cost Basis: $${result.averageCostPerOunce.toFixed(2)} /oz
    - Total Profit: $${result.totalProfit.toFixed(2)}
    - Return on Investment: ${result.roi.toFixed(2)}%
    
    Constraint: The user gets a fixed discount on every purchase.
    
    Please provide:
    1. A concise performance summary (2-3 sentences).
    2. Three strategic recommendations for the next period based on current market trends.
    3. Use Google Search to provide current real-time gold market sentiment and major price drivers (central bank buying, inflation data, etc.).
    
    Format the response clearly with headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Analysis unavailable.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    // Improved resilient parsing
    const sections = text.split(/(?:\d\.|Summary:|Recommendations:|Market Context:)/i);
    
    return {
      summary: sections[1]?.trim() || text.split('\n')[0],
      recommendations: sections[2]?.split('\n').filter(l => l.trim().length > 10).slice(0, 3).map(r => r.replace(/^[-*•\s]+/, '').trim()) || ["Monitor spot levels", "Rebalance monthly", "Consider inflation hedge"],
      marketContext: sections[3]?.trim() || "The gold market continues to react to global macroeconomic shifts.",
      sources: sources.slice(0, 5),
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Simulation analysis currently offline. Please try again in a moment.",
      recommendations: ["Ensure API connectivity", "Check market data availability"],
      marketContext: "Real-time market context requires an active connection.",
      sources: [],
    };
  }
};
