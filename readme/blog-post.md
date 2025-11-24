
# Building Veritas AI: A Technical Deep-Dive into Real-Time Fact-Checking with Gemini

In an era saturated with information, the ability to quickly distinguish fact from fiction is more critical than ever. This challenge inspired me to build **Veritas AI**, a real-time fact-checking web application. 

In this post, I'll take you on a technical deep-dive into how I built it. We will cover the high-level architecture, the specific user flow, the API sequence, and the prompt engineering required to make it work.

## The Goal

The goal was to create an application that delivers not just an answer, but a trustworthy, verifiable result. This meant providing three key components for every query:
1.  A clear, unambiguous **verdict**: Is the claim true, false, or more nuanced?
2.  A detailed **explanation** of the reasoning behind the verdict.
3.  A list of verifiable **sources** to build trust and encourage further research.

---

## 1. System Design

To ensure the application was robust and scalable, I approached the development with a formal design process.

### High-Level Architecture (HLD)
Veritas AI follows a clean **Client-Server** model, but with a twist: it utilizes a "Serverless" approach where the client communicates directly with the AI provider. You can view the full [High-Level Design document here](./HLD.md).

By leveraging the `@google/genai` SDK directly in the browser, we eliminate the need for a complex middle-tier for this specific use case, reducing latency and infrastructure complexity.

Here is the high-level component hierarchy:

```mermaid
graph TD
    subgraph "User's Browser"
        A[User] --> B{React Web App};
        B --> C[UI Components];
        B --> D[Gemini Service];
    end

    subgraph "Google Cloud"
        E[Gemini API];
        F[Google Search];
    end

    D -- "Sends prompt with claim" --> E;
    E -- "Grounds the request" --> F;
    F -- "Returns search results" --> E;
    E -- "Generates response (verdict, explanation, sources)" --> D;
    D -- "Returns parsed result" --> B;
    C -- "Displays result to user" --> A;

    style B fill:#61DAFB,stroke:#333,stroke-width:2px;
    style E fill:#4285F4,stroke:#333,stroke-width:2px,color:#fff;
    style F fill:#34A853,stroke:#333,stroke-width:2px,color:#fff;
```

### Low-Level Design (LLD)
The application is structured as a tree of React components (`App` -> `ResultCard`, `History`), utilizing TypeScript interfaces for strict type safety on the API responses. The prompt parsing logic—converting raw text into a `FactCheckResult` object—is the core logic component. Detailed component structures and interface definitions can be found in the [Low-Level Design document](./LLD.md).

---

## 2. The User Flow

To ensure a smooth user experience, I mapped out the application flow. I separated the main logic from the history interaction to keep things clear.

### Main Fact-Check Flow

This diagram visualizes the decision logic from the moment the user enters a claim to when they receive a result.

```mermaid
graph TD
    A[Start] --> B{User enters a claim};
    B --> C{User clicks 'Check'};
    C --> D{Is the claim empty?};
    D -- Yes --> B;
    D -- No --> E[Show loading spinner & disable form];
    E --> F[Send claim to Gemini Service];
    F --> G{API call to Gemini w/ Search Grounding};
    G --> H{API call successful?};
    H -- No --> I[Display error message];
    H -- Yes --> J[Parse response];
    J --> K[Extract Verdict, Explanation, and Sources];
    K --> L[Display Result Card & add to history];
    I --> M[End];
    L --> M;

    style G fill:#f9f,stroke:#333,stroke-width:2px;
    style A fill:#4CAF50,stroke:#333,stroke-width:2px,color:white;
    style M fill:#F44336,stroke:#333,stroke-width:2px,color:white;
```

### History Interaction Flow

This separate flow handles how users interact with their saved results in the sidebar.

```mermaid
graph TD
    N[User views history sidebar] --> O{User clicks a past item};
    O --> P[Load claim and result into main view];
    P --> Q[End Interaction];
    N --> R{User clicks 'Clear History'};
    R --> S[Remove all items from history and UI];
    S --> Q;

    style Q fill:#F44336,stroke:#333,stroke-width:2px,color:white;
```

**UX Considerations:**
1.  **Input Validation**: We prevent empty calls (See node `D`) to save API quota.
2.  **Loading States**: Fact-checking with grounding takes slightly longer than standard text generation (2-4 seconds). A clear loading spinner (`E`) is essential.
3.  **History**: We immediately persist the result to `localStorage` and update the sidebar (`L`) so users don't lose their research.

---

## 3. The API Sequence

The most complex part of the application is the handshake between the React App, the Service Layer, and the Gemini API. 

The `geminiService.ts` file acts as the bridge. It handles prompt construction, error catching, and response parsing.

### New Fact-Check Request

This details exactly what happens when the user clicks "Check":

```mermaid
sequenceDiagram
    participant User
    participant ReactApp as React App (UI)
    participant GeminiService as Gemini Service
    participant GeminiAPI as Gemini API w/ Grounding
    participant LocalStorage as Browser Local Storage

    User->>+ReactApp: Enters claim and clicks "Check"
    ReactApp->>ReactApp: Set state (isLoading = true)
    ReactApp->>+GeminiService: factCheckWithGoogleSearch(claim)
    GeminiService->>+GeminiAPI: generateContent({ contents: prompt, config: { tools: [...] } })
    Note right of GeminiAPI: Gemini performs Google Search<br/>to ground the response.
    GeminiAPI-->>-GeminiService: returns GenerateContentResponse
    GeminiService->>GeminiService: Parse response text and grounding metadata
    GeminiService-->>-ReactApp: returns Promise<FactCheckResult>
    ReactApp->>ReactApp: Set state (isLoading = false, result = data)
    ReactApp->>+LocalStorage: Save new result to history
    LocalStorage-->>-ReactApp: 
    ReactApp-->>-User: Display ResultCard and update history sidebar
```

---

## 4. The Code Implementation

### The Prompt Strategy
The most critical part of interacting with an LLM is the prompt. To ensure a consistent and parsable response, I engineered a prompt that explicitly instructs the model on the desired output format.

```typescript
// from services/geminiService.ts
const prompt = `Analyze the following statement for its factual accuracy. 
Begin your response with one of the following verdicts on a single line: 
"VERDICT: TRUE", "VERDICT: FALSE", or "VERDICT: MIXED". 
After the verdict, provide a concise but detailed explanation...`;
```

By forcing the model to output `VERDICT: X` first, we can easily parse the result in JavaScript using basic string manipulation, rather than hoping for a valid JSON object which can sometimes be flaky with smaller models.

### Enabling Search Grounding
To build a *real-time* fact-checker, the model needs access to the live web. Activating Gemini's Google Search grounding feature is surprisingly simple in the config:

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

### Parsing Sources
The API returns a specific `groundingMetadata` object. We map this to our UI type:

```typescript
const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
```

## Conclusion

Building Veritas AI was a powerful demonstration of how modern AI tools like the Gemini API can be combined with a robust frontend framework like React. 

By mapping out the **Architecture (Top-Down)** to understand the system components, and the **User Flow (Top-Down)** to understand the experience, we were able to write clean, efficient code that solves a real-world problem.

#AI #GoogleGemini #FactChecking #WebDevelopment #React #TypeScript
