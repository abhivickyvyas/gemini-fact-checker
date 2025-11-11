import { GoogleGenAI } from "@google/genai";
import { FactCheckResult, Verdict, GroundingChunk } from '../types';

export async function factCheckWithGoogleSearch(claim: string): Promise<FactCheckResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze the following statement for its factual accuracy. Begin your response with one of the following verdicts on a single line: "VERDICT: TRUE", "VERDICT: FALSE", or "VERDICT: MIXED". After the verdict, provide a concise but detailed explanation of your findings, citing the information you discovered. Statement: "${claim}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const fullText = response.text;
    const lines = fullText.split('\n');
    const verdictLine = lines.find(line => line.toUpperCase().startsWith('VERDICT:'));

    if (!verdictLine) {
      // If no verdict is found, treat the whole response as an explanation with a MIXED verdict
      return {
        verdict: Verdict.MIXED,
        explanation: fullText.trim(),
        sources: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [],
      };
    }
    
    let verdict = Verdict.MIXED;
    const upperVerdictLine = verdictLine.toUpperCase();
    if (upperVerdictLine.includes('TRUE')) {
      verdict = Verdict.TRUE;
    } else if (upperVerdictLine.includes('FALSE')) {
      verdict = Verdict.FALSE;
    }
    
    // Find the index of the verdict line and join everything after it.
    const verdictLineIndex = lines.findIndex(line => line.toUpperCase().startsWith('VERDICT:'));
    const explanation = lines.slice(verdictLineIndex + 1).join('\n').trim();

    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return { verdict, explanation, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response from the fact-checking service. Please try again.");
  }
}
