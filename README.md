# Jobfit — Ship69 Day 58

Two tools in one. Paste a job description and either:
- **Fit Check** — answer 4 quick questions and get a scored honest verdict on whether to apply
- **CV Match** — paste your CV bullets and get them rewritten to match the JD's language

## Stack
- Vanilla HTML/CSS/JS
- Vercel serverless function
- Groq (OpenAI-compatible) API

## Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variable: `GROQ_API_KEY` = your key
4. Deploy

## Environment variables
| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq API key |

## Project structure
```
jobfit/
├── index.html       # Main UI
├── api/
│   └── jobfit.js    # Serverless API route
├── vercel.json      # Routing config
├── .gitignore
└── README.md
```
