
# Building Veritas AI: A Technical Deep-Dive into Real-Time Fact-Checking with Gemini and React

In an era saturated with information, the ability to quickly distinguish fact from fiction is more critical than ever. This challenge inspired me to build **Veritas AI**, a real-time fact-checking web application. In this post, I'll take you on a technical deep-dive into how I built it, from prompt engineering and API integration to creating a polished user experience with React.

The goal was to create an application that delivers not just an answer, but a trustworthy, verifiable result. This meant providing three key components for every query:
1.  A clear, unambiguous **verdict**: Is the claim true, false, or more nuanced?
2.  A detailed **explanation** of the reasoning behind the verdict.
3.  A list of verifiable **sources** to build trust and encourage further research.

Let's dive into the code.

### The Core Architecture: Client-Side Power

Veritas AI is a single-page application built with **React, TypeScript, and Tailwind CSS**. A key architectural decision was to make it entirely client-side. The app communicates directly from the user's browser to the Google Gemini API, which is made possible by the simplicity and power of the `@google/genai` SDK. This approach simplifies deployment and eliminates the need for a dedicated backend server, making it a lean and efficient solution.

### The Heart of the App: The `geminiService`

All communication with the Gemini API is encapsulated in a single file, `services/geminiService.ts`. The core of this service is the `factCheckWithGoogleSearch` function.

#### 1. Prompt Engineering: The Key to Structured Output

The most critical part of interacting with an LLM is the prompt. To ensure a consistent and parsable response, I engineered a prompt that explicitly instructs the model on the desired output format.

```typescript
// from services/geminiService.ts
const prompt = `Analyze the following statement for its factual accuracy. Begin your response with one of the following verdicts on a single line: "VERDICT: TRUE", "VERDICT: FALSE", or "VERDICT: MIXED". After the verdict, provide a concise but detailed explanation of your findings, citing the information you discovered. Statement: "${claim}"`;
```

By demanding the `VERDICT:` line first, I turn the LLM's freeform text output into a more structured, predictable API response that my application can reliably parse.

#### 2. Gemini with Google Search Grounding

To build a *real-time* fact-checker, the model needs access to the live web. This is where Gemini's Google Search grounding feature becomes a game-changer. Activating it is surprisingly simple:

```typescript
// from services/geminiService.ts
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    // This single line connects the model to live Google Search results
    tools: [{googleSearch: {}}],
  },
});
```
This tells Gemini to not rely solely on its training data but to perform a live Google search to ground its response in current, verifiable information. The best part? The API response automatically includes the `groundingMetadata`—a structured list of the web pages it used as sources.

#### 3. Parsing the Response

Once the API returns a response, the client-side code has to parse it. The structured prompt makes this much easier.

```typescript
// from services/geminiService.ts
const fullText = response.text;
const lines = fullText.split('\n');
const verdictLine = lines.find(line => line.toUpperCase().startsWith('VERDICT:'));

// If no verdict is found, we have a graceful fallback
if (!verdictLine) {
  return { /* return the full text with a MIXED verdict */ };
}

// Extract the verdict and join the remaining lines for the explanation
const verdictLineIndex = lines.findIndex(line => line.toUpperCase().startsWith('VERDICT:'));
const explanation = lines.slice(verdictLineIndex + 1).join('\n').trim();

// The sources are already structured for us!
const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
```
This robust parsing logic reliably separates the verdict from the explanation, ensuring the UI can display them correctly.

### Building a Polished Frontend with React

The frontend is where the application comes to life.

#### State Management with Hooks

I used React's `useState` hook to manage all the essential application state:
-   `claim`: The user's input text.
-   `isLoading`: A boolean to show/hide the spinner and disable the form during API calls.
-   `result`: An object containing the fact-check result (`verdict`, `explanation`, `sources`).
-   `error`: A string for displaying any API or network errors.
-   `history`: An array of past fact-checks.

The `handleCheckClaim` function orchestrates the API call, wrapping it in a `try...catch...finally` block to manage the `isLoading` and `error` states correctly.

#### Persistent History with `localStorage`

To make the app a practical tool, I added a persistent history feature using `localStorage`. Two `useEffect` hooks handle this: one to load history on component mount, and another to save any new results to storage.

```typescript
// from App.tsx - Load history from localStorage
useEffect(() => {
  try {
    const storedHistory = localStorage.getItem('factCheckHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    localStorage.removeItem('factCheckHistory'); // Clear corrupted data
  }
}, []);

// from App.tsx - Save history to localStorage whenever it changes
useEffect(() => {
  if (history.length > 0) {
    localStorage.setItem('factCheckHistory', JSON.stringify(history));
  } else {
    // Clean up if history is cleared
    localStorage.removeItem('factCheckHistory');
  }
}, [history]);
```

#### The "Share" Feature: `html2canvas` and the Web Share API

One of my favorite features is the ability to share the result card as an image. This was achieved using the `html2canvas` library, which can capture a DOM element and convert it into a canvas image.

```typescript
// from components/ResultCard.tsx
const handleShare = async () => {
    if (!cardRef.current) return;

    // 1. Convert the component's div to a canvas
    const canvas = await html2canvas(cardRef.current);
    // 2. Get a Blob from the canvas
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    
    // 3. Create a File object from the Blob
    const file = new File([blob], 'veritas-ai-fact-check.png', { type: 'image/png' });

    // 4. Use the Web Share API if available, with a download fallback
    if (navigator.share && navigator.canShare) {
        await navigator.share({
            title: 'Veritas AI: Fact-Check Result',
            files: [file],
        });
    } else {
        // Fallback for desktop browsers
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'veritas-ai-fact-check.png';
        link.click();
        URL.revokeObjectURL(link.href);
    }
};
```
This provides a native sharing experience on mobile devices while offering a seamless download alternative on desktop, enhancing the app's utility.

### Conclusion

Building Veritas AI was a powerful demonstration of how modern AI tools like the Gemini API can be combined with a robust frontend framework like React to create impactful, real-world applications. The key takeaways were the importance of structured prompt engineering, the game-changing power of Search grounding for factual accuracy, and how thoughtful UX can elevate a simple tool into a valuable resource.

The fight against misinformation is ongoing, but with powerful and accessible tools like Gemini, developers are better equipped than ever to contribute to the solution.

#AI #GoogleGemini #FactChecking #WebDevelopment #React #TypeScript #GenAI #Misinformation #TechForGood #UIUX #PromptEngineering
