
I built a tool to fight misinformation in real-time. Here's a look under the hood.

In a world of information overload, getting to the truth quickly is a superpower. That's why I created **Veritas AI**—a web app that uses the Google Gemini API to instantly fact-check any claim.

I named it Veritas AI—from the Latin word for 'truth'—because I wanted to build a tool that brings clarity and verifiable facts to the forefront.

**How it works (the tech bits):**
The app's core is the Gemini API with **Search Grounding**. This ensures every response is based on up-to-the-minute web data, not just the model's static training knowledge.

The biggest technical challenge was getting a structured, predictable response from the AI. My solution was **prompt engineering**. I crafted a specific prompt that forces Gemini to return a clean `VERDICT: TRUE/FALSE/MIXED` line first, followed by its detailed explanation. This makes parsing the response on the client-side robust and reliable.

**The Tech Stack:**
- **AI**: Google Gemini (`gemini-2.5-flash`) with Search Grounding
- **Frontend**: A snappy, fully responsive UI built with React, TypeScript, and Tailwind CSS.
- **Cool Feature**: I even added a "Share" button that uses `html2canvas` and the Web Share API to export the result card as an image directly from the browser.

This project was a fantastic deep-dive into building practical AI-powered tools. The `@google/genai` SDK is a pleasure to work with, and the power of grounding is a game-changer for applications requiring factual accuracy.

What are the most interesting applications of grounded AI models you've seen or thought of?

#GoogleGemini #GenAI #FactChecking #Misinformation #React #TypeScript #WebDevelopment #AIForGood #Developer #UIUX #PromptEngineering
