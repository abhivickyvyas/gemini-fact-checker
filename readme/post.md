**Can AI actually handle the truth?** 🕵️‍♂️

I spent the weekend building **Veritas AI** to find out. It's a real-time fact-checking engine that doesn't just "guess"—it researches.

Most LLMs hallucinate. They are creative engines, not databases. To fix this, I used **Google Search Grounding** with the Gemini API.

Instead of predicting the next word, the model:
✅ **Tools**: Recognizes it needs verification.
🔍 **Searches**: Performs live Google searches.
🧠 **Synthesizes**: Combines its knowledge with real citations.
🔗 **Attributes**: Links specific claims to specific URLs.

I built the frontend in **React + TypeScript** with a serverless architecture to keep it fast and lightweight.

I wrote a full engineering breakdown covering:
*   High-Level Design (HLD) & Low-Level Design (LLD)
*   Prompt engineering strategies for deterministic UI
*   How to handle grounding metadata

👇 **Read the full deep dive below!**

#GoogleGemini #SoftwareEngineering #React #TypeScript #GenAI #SystemDesign #WebDevelopment