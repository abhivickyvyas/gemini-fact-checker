# Veritas AI: Sequence Diagrams

These diagrams detail the sequence of interactions within the application for different user actions.

### New Fact-Check Request

This diagram shows the process when a user submits a new claim to be fact-checked.

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

### Loading from History

This diagram shows the simple, client-side process when a user clicks on a previously checked item in the history sidebar.

```mermaid
sequenceDiagram
    participant User
    participant ReactApp as React App (UI)
    participant LocalStorage as Browser Local Storage

    User->>+ReactApp: Clicks on a history item in the sidebar
    Note over ReactApp: No API call is made.
    ReactApp->>ReactApp: Set state from clicked item (claim, result)
    ReactApp-->>-User: Display existing ResultCard instantly
```