# Open Lovable

Chat with AI to build React apps instantly with beautiful UI components.

## 🎨 Open Lovable UI Agent

**NEW**: This repository includes a specialized Claude Code agent that brings professional 3D effects, smooth animations, and premium styling to any React project.

### Quick Start with UI Agent
```
Tell Claude Code: "Build with Open Lovable design system"
```

The agent automatically:
- ✅ Uses premium UI components from this repository
- ✅ Installs required dependencies  
- ✅ Configures Tailwind with custom theme
- ✅ Creates beautiful, professional interfaces

📖 **[Learn more about the UI Agent →](claude-agent/README.md)**

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/yourusername/e2b.git
cd e2b
npm install
```

2. **Add `.env.local`**
```env
# Required
E2B_API_KEY=your_e2b_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

3. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Get API Keys

[firecrawl.dev](https://firecrawl.dev) → Web scraping  
[e2b.dev](https://e2b.dev) → Sandboxes  
[console.groq.com](https://console.groq.com) → Fast inference (Kimi K2 - recommended)  
[platform.openai.com](https://platform.openai.com) → GPT-5  

## Example Chat

```
You: "Clone the Stripe pricing page"
AI: *generates full pricing component*

You: "Make it dark mode"  
AI: *adds theme switching*

You: "Add animations"
AI: *implements Framer Motion*

You: "Deploy this"
AI: *guides deployment*
```

## Features

- Live preview with hot reload
- Automatic package installation
- Multiple AI models
- Web scraping with Firecrawl
- Sandboxed execution

## License

MIT