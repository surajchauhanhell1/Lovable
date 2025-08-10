<div align="center">

# KPPM

Chat with AI to build React apps instantly.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="KPPM Demo" width="100%"/>

</div>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/mendableai/open-lovable.git
cd open-lovable
npm install
```

2. **Add `.env.local`**
```env
# Required
E2B_API_KEY=your_e2b_api_key  # Get from https://e2b.dev (Sandboxes)
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com (GPT-5)
GROQ_API_KEY=your_groq_api_key  # Get from https://console.groq.com (Fast inference - Kimi K2 recommended)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key  # Get from https://ai.google.dev

# OpenRouter (supports free models like qwen/qwen3-coder:free)
OPENROUTER_API_KEY=your_openrouter_key  # Get from https://openrouter.ai
# Optional but recommended for OpenRouter rate limits/analytics
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=KPPM

# Optional: Custom OpenAI-compatible endpoint
# Some providers only support Chat Completions (POST /v1/chat/completions) not Responses (POST /v1/responses).
# If your provider rejects /v1/responses with 403, route through a gateway that translates to Chat Completions
# (e.g., Vercel AI Gateway) OR use a provider that supports the Responses API.
# Example (Vercel AI Gateway):
# OPENAI_BASE_URL=https://gateway.ai.cloudflare.com/v1/... (or your Vercel AI Gateway URL)
# Otherwise, set a base URL that supports /v1/responses.
```

3. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  

## License

MIT