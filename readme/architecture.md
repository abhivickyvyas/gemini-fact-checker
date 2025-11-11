# Veritas AI: Application Architecture

This diagram illustrates the high-level architecture of the Veritas AI application. It follows a simple client-server model where the frontend application communicates directly with the Google Gemini API.

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

## Components

-   **React Web App**: The single-page application (SPA) that the user interacts with. It manages the UI state and orchestrates the data flow.
-   **UI Components**: Reusable React components for rendering the input form, result card, error alerts, and other UI elements.
-   **Gemini Service**: A dedicated module that encapsulates the logic for communicating with the Gemini API. It constructs the prompt, makes the API call, and parses the response.
-   **Gemini API**: The backend AI service from Google that processes the natural language prompt.
-   **Google Search**: Used as a grounding tool by the Gemini API to fetch real-time, verifiable information from the web to ensure the factual accuracy of the response.