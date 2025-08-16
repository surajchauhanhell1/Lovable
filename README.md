# Open Lovable

Chat with AI to build React apps instantly. Made by the [Firecrawl](https://firecrawl.dev/?ref=open-lovable-github) team.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Open Lovable Demo" width="100%"/>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/mendableai/open-lovable.git
cd open-lovable
npm install
```

2. **Set up Supabase**
- Go to [Supabase](https://supabase.com/) and create a new project.
- Go to the "Authentication" section and enable the Google and GitHub providers. You will need to get the client ID and secret for each provider from their respective developer consoles.
- Go to the "Database" section and get your database connection string.
- Go to the "Settings" > "API" section and get your Project URL, anon key, and service role key.

3. **Add `.env.local`**
Create a `.env.local` file in the root of the project and add the following environment variables:
```env
# Required
E2B_API_KEY=your_e2b_api_key  # Get from https://e2b.dev (Sandboxes)
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com (GPT-5)
GEMINI_API_KEY=your_gemini_api_key  # Get from https://aistudio.google.com/app/apikey
GROQ_API_KEY=your_groq_api_key  # Get from https://console.groq.com (Fast inference - Kimi K2 recommended)

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DATABASE_URL=your_supabase_database_url_here

# Payment provider credentials
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key_here
FLUTTERWAVE_SECRET_HASH=your_flutterwave_secret_hash_here

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run Database Migrations**
```bash
npm run db:generate
npm run db:migrate
```

5. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  

## License

MIT
