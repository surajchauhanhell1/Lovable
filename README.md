<div align="center">

# Open Lovable - AI Website Generator

Clone any website and get a clean React app you can run and deploy.

## Features

- 🚀 **One-click website cloning** - Just paste a URL and get a React app
- 🎨 **AI-powered generation** - Uses Claude Sonnet 4 to recreate websites
- 🔧 **Live sandbox** - See your code running in real-time
- 📱 **Responsive design** - Works on desktop and mobile
- 🎯 **Multiple styles** - Choose from different design approaches
- 📦 **Export options** - Download as ZIP or deploy to Vercel

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/open-lovable.git
   cd open-lovable
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Anthropic API key
   ANTHROPIC_API_KEY=your_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a website URL** in the input field
2. **Choose a style** (Neobrutalist, Glassmorphism, etc.)
3. **Wait for AI generation** - this may take 30-60 seconds
4. **Preview your site** in the live sandbox
5. **Download or deploy** your generated React app

## Deployment

### Option 1: Download as ZIP
- Click the download button to get your project as a ZIP file
- Extract and run locally with `npm install && npm run dev`
- Deploy to any hosting service manually

### Option 2: Deploy to Vercel (Requires Setup)
To enable one-click Vercel deployment:

1. **Get your Vercel token:**
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create a new token with deployment permissions

2. **Add to environment:**
   ```bash
   # Add to your .env.local file
   VERCEL_TOKEN=your_token_here
   ```

3. **Redeploy your app** and the deploy button will work!

### Option 3: Manual Vercel Deployment
1. Download your project as ZIP
2. Go to [vercel.com](https://vercel.com)
3. Create new project and upload the ZIP
4. Vercel will automatically detect it's a Vite/React app

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional (for Vercel deployment)
VERCEL_TOKEN=your_vercel_token
```

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **AI:** Claude Sonnet 4 via Anthropic API
- **Sandbox:** E2B for live code execution
- **Deployment:** Vercel API integration
- **Styling:** Tailwind CSS with custom components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

If you encounter issues:
1. Check the console for error messages
2. Ensure your API keys are properly set
3. Try refreshing the page
4. Open an issue on GitHub

---

Built with ❤️ by the Open Lovable team