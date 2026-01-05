
import { GoogleGenAI } from "@google/genai";
import { SimulationResult, AIAnalysis } from "../types";

export const getAIAnalysis = async (result: SimulationResult): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following gold investment simulation:
    - Total Invested: $${result.totalInvested.toFixed(2)}
    - Total Gold Accumulated: ${result.totalGoldOunces.toFixed(4)} oz
    - Final Portfolio Value: $${result.finalPortfolioValue.toFixed(2)}
    - Average Cost Basis: $${result.averageCostPerOunce.toFixed(2)} per oz
    - ROI: ${result.roi.toFixed(2)}%
    - Unique Strategy: Monthly 2% discount on gold purchase price.

    Please provide:
    1. A brief summary of the performance.
    2. A list of 3 strategic recommendations.
    3. Current real-time context of the gold market (use Google Search to find current spot prices and trends).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Unable to generate analysis at this time.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    // Split text into sections based on simple heuristics since we aren't using JSON mode for text with search
    const lines = text.split('\n');
    let summary = "";
    let recommendations: string[] = [];
    let marketContext = "";
    
    let currentSection = 0;
    lines.forEach(line => {
      if (line.toLowerCase().includes('summary')) { currentSection = 1; return; }
      if (line.toLowerCase().includes('recommendations')) { currentSection = 2; return; }
      if (line.toLowerCase().includes('market')) { currentSection = 3; return; }

      if (currentSection === 1) summary += line + " ";
      if (currentSection === 2 && line.trim().startsWith('-')) recommendations.push(line.replace('-', '').trim());
      if (currentSection === 3) marketContext += line + " ";
    });

    return {
      summary: summary.trim() || text.substring(0, 300) + "...",
      recommendations: recommendations.length > 0 ? recommendations : ["Maintain consistency", "Monitor spot prices", "Diversify related assets"],
      marketContext: marketContext.trim() || "Gold remains a strong hedge against inflation according to recent trends.",
      sources,
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Error generating AI analysis. Please check your connection.",
      recommendations: ["Error loading insights"],
      marketContext: "Error loading market context.",
      sources: [],
    };
  }
};
