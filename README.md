# Veritas AI

<p align="center">
  <img src="readme/veritas-banner.svg" alt="Veritas AI Banner" width="100%" />
</p>

<h3 align="center">
  <a href="readme/blog-post.md"><strong>📖 READ THE ENGINEERING CASE STUDY »</strong></a>
</h3>
<p align="center">
  (Architecture, HLD, LLD & Prompt Engineering Strategy)
</p>

<br />

**Veritas AI** is a real-time fact-checking engine. It solves the "hallucination" problem in LLMs by using the **Gemini API** with **Google Search Grounding**. It verifies claims instantly, providing a verdict, explanation, and cited sources.

## Core Features

*   **⚡ Real-Time Verification**: Reduces the time-to-fact-check from hours to seconds.
*   **🔍 Search Grounding**: Leverages live Google Search results to validate AI responses.
*   **🛡️ Hallucination Defense**: Strict prompt engineering enforces verifiable citations.
*   **📱 Mobile-First Design**: Responsive React UI with local history persistence.

## Quick Start

1.  **Clone & Enter**
    ```bash
    git clone <repository-url>
    cd veritas-ai
    ```

2.  **Configure Key**
    Create a `.env` file or set the variable directly (for local dev):
    ```bash
    export API_KEY=YOUR_GEMINI_API_KEY
    ```

3.  **Run**
    Open `index.html` in a live server. No build step required (ES Modules).

## Engineering Deep Dive

I wrote a detailed breakdown of how this system handles **Prompt Engineering**, **State Management**, and **Search Grounding**.

👉 **[Read the full Architecture Breakdown](readme/blog-post.md)**

---

*Built with React 19, TypeScript, and Google Gemini.*
