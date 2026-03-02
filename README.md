# BlitzGeo 🚀

**AI Brand Visibility Audit Platform**

Discover how your brand appears across AI search engines. Audit GPT-5, Gemini, Claude, and Perplexity in seconds to understand your visibility in the age of AI.

---

## What is BlitzGeo?

BlitzGeo is the first platform designed to help brands measure and improve their visibility in Generative AI results. As search behaviors shift from traditional links to AI-synthesized answers, BlitzGeo provides the insights needed to ensure your brand is correctly represented.

---

## Key Features

### 🆕 AI Index Audit (Index Knowledge Graph)
**Reverse-engineer the "AI Brain" regarding your brand.**

Traditional SEO tracking doesn't work for LLMs. Our Index Knowledge Graph (IKG) probes AI models to reveal their internal representation of your brand entity.

- **Recall Boundary**: Determine exactly which of your digital assets the AI can "remember" and retrieve.
- **Concept Anchors**: Identify the key phrases and associations the AI firmly links to your brand.
- **Dominance**: See which external sources are effectively rewriting your brand narrative.
- **Negative Space**: Discover critical information gaps where the AI hallucinates or remains silent.

### 💬 Geo Chat
**Talk to your Data.**

Don't just look at charts—interact with them. Geo Chat allows you to have a conversation with your audit results.
- **Deep Analysis**: Ask complex questions like "Why did Gemini favor these competitors?"
- **Strategy Generation**: Get AI-generated recommendations for improving your visibility.
- **Persistent Memory**: Your chats are saved for 72 hours, allowing for ongoing analysis.

### ✅ Standard Audits
**Real-time response tracking across the AI landscape.**

- **Multi-Model Coverage**: Simultaneously audit GPT-5, Gemini 2.5 Pro, Claude Opus 4.5, Perplexity Sonar, and DeepSeek.
- **Blitz Score**: A unified 0-100 metric for your brand's presence in AI answers.
- **Citation Extraction**: Automatically identify and list every source cited by the AI.

---

## Design Philosophy

- **Dark Mode Native**: A premium, focus-driven interface designed for professional analysts.
- **Optimistic Performance**: Instant feedback loops for a responsive, modern experience.
- **Data-Driven**: We focus on observable retrieval evidence, not black-box guesses.

---

## Development

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```

The backend API will be available at `http://localhost:8000`.

---

## License

MIT
