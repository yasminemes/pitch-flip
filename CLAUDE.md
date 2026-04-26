# PitchFlip — Claude Code Context

## What this product does

PitchFlip converts investor pitch decks into bespoke customer sales narratives, personalised per prospect. Founders upload a deck (PDF/PPTX), the tool researches the company, the founder, and the target prospect — then writes a sales deck designed around that buyer's specific pain points and context.

## Project structure

```
pitch-product/
├── frontend/                  # Next.js 14 (TypeScript) — deployed on Vercel
│   └── app/
│       ├── page.tsx           # Single-page UI: upload, prospect fields, output, brief panel
│       ├── layout.tsx
│       └── globals.css
├── backend/                   # Python + FastAPI — deployed on Railway
│   ├── main.py                # /rewrite and /rewrite-bulk endpoints
│   ├── requirements.txt
│   ├── skills/
│   │   ├── skill1_company_intelligence.py  # Deck parsing + founder/company research → Company Brief
│   │   ├── skill2_buyer_intelligence.py    # Prospect research → Buyer Brief
│   │   └── skill3_synthesis.py             # Combines briefs → generation prompt
│   └── prompts/
│       ├── company_brief.txt        # Prompt: raw deck + research → Company Intelligence Brief
│       ├── buyer_brief.txt          # Prompt: raw research → Buyer Intelligence Brief
│       ├── rewrite_generic_v2.txt   # Prompt: Company Brief + deck → generic sales deck
│       ├── rewrite_tailored_v2.txt  # Prompt: both briefs + deck → tailored sales deck
│       ├── rewrite.txt              # Legacy generic prompt (used by bulk)
│       └── rewrite_tailored.txt     # Legacy tailored prompt (used by bulk)
└── PRD.md
```

## Tech stack

- **Frontend**: Next.js 14 (TypeScript), deployed on Vercel
- **Backend**: Python 3.11+, FastAPI, deployed on Railway
- **Database + Storage + Auth**: Supabase — not yet built; next milestone
- **AI**: Claude API via `anthropic` Python SDK
  - `claude-sonnet-4-6` — Skill 1 synthesis, Skill 2 synthesis, Skill 3 generation (streaming)
  - `claude-haiku-4-5-20251001` — fast extraction of company/founder names from deck in Skill 1
- **Document parsing**: `python-pptx` (PPTX), `PyMuPDF` (PDF)
- **Prospect enrichment**: `duckduckgo-search` + `httpx` + `beautifulsoup4` — 10–14 targeted queries per rewrite, no paid API

## Three-skill pipeline

Every `/rewrite` call runs this pipeline:

```
[Parse deck]
     ↓
[Skill 1: Company & Founder Intelligence]  ─┐  asyncio.gather (parallel)
[Skill 2: Buyer Intelligence]              ─┘
     ↓
[Skill 3: Synthesis → generation prompt]
     ↓
[Stream deck to frontend]
```

- **Skill 1** always runs. Researches the founder and company, produces a Company Intelligence Brief.
- **Skill 2** only runs when `company_name` is provided. Researches the prospect, produces a Buyer Intelligence Brief. Includes: individual pain points, company pain points, industry trends, strategic priorities, recent developments, objection landscape.
- **Skill 3** never calls external APIs. Consumes both briefs and produces the generation prompt. Decides opening hook type, which slides to include, slide sequence, and slide count (3–6, bespoke per case).

## Key conventions

- All AI calls go through the backend — never call the Claude API from the frontend
- Output is streamed via Server-Sent Events (SSE) with typed events:
  - `{"type": "status", "text": "..."}` — pipeline stage label shown in UI
  - `{"type": "text", "text": "..."}` — streamed deck content
  - `{"type": "brief", "data": "..."}` — full Buyer Intelligence Brief (stored in frontend state, revealed on demand)
- Prompt templates live in `backend/prompts/` as `.txt` files, not hardcoded in Python
- Output slide count is 3–6, bespoke — not fixed at 6. Determined by Skill 3 based on the briefs.
- Output format: markdown with slide hints as HTML comments: `<!-- Slide 1: Title | Layout: Headline + 3 bullets -->`
- Environment variables are never committed; use `.env.local` (frontend) and `.env` (backend)
- Sync Anthropic streaming is bridged into the async FastAPI generator via `asyncio.Queue` + `loop.call_soon_threadsafe`

## Prospect tailoring inputs

The `/rewrite` endpoint accepts multipart form fields alongside the file:
- `company_name` (string, optional) — triggers Skill 2 and tailored output when present
- `contact_title` (string, optional) — e.g. "Head of Sales"
- `contact_department` (string, optional) — e.g. "Revenue"

## Prospect Intelligence Brief

When `company_name` is provided, the Buyer Intelligence Brief is included in the SSE stream as a `{"type": "brief", "data": "..."}` event. The frontend stores it in React state. A "View prospect brief" button appears after generation — clicking it reveals the brief inline below the deck output. No second API call.

## Auth

- Not yet built. Next milestone after core rewrite is stable.
- Plan: Supabase Auth, email/password only (Google OAuth out of scope for MVP)
- Free tier: 1 generic rewrite + 1 tailored rewrite. Paid: unlimited at $19/month.

## Out of scope for MVP

- Branded deck output (PPTX/PDF generation with user's design)
- Native Gamma / Google Slides / Canva integrations
- Google Slides ingestion (requires OAuth + Slides API — V2)
- Team accounts or collaboration
- CRM integrations
- Deck scoring or evaluation features
