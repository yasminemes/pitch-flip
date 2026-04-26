# PitchFlip — Product Requirements Document

## Problem

Founders spend weeks perfecting their investor pitch deck, then show the same deck to customers — and it falls flat. Investor decks lead with vision, market size, and traction. Customer decks need to lead with the buyer's problem and why the product solves it better than anyone else. Most founders don't have the time or bandwidth to restructure and rewrite their deck for a sales context — let alone personalise it per prospect.

## Target User

Early-stage founders (Seed to Series A) who:
- Have an existing investor pitch deck
- Are beginning to sell to customers directly
- Don't have a dedicated sales or marketing team to do this translation for them

## Core Value Proposition

PitchFlip turns your investor pitch deck into a personalised sales-deck intelligence engine. It researches the founder, the company, and the specific prospect — then writes a bespoke customer narrative designed around that buyer's actual pain points, not a generic rewrite template.

---

## Intelligence Architecture

PitchFlip processes every rewrite through a three-skill pipeline. The skills are mutually exclusive in what they own and collectively exhaustive of what's needed to produce the output.

### Skill 1 — Company & Founder Intelligence

Runs on every rewrite. Owns the supply side.

**What it does:**
1. Parses the uploaded deck and extracts a structural understanding: narrative arc, proof points, business model, ICP, and pricing signals
2. Uses a fast model call to extract the company name and founder names from the deck content
3. Researches the company externally: product overview, funding/investor signals, news, customer evidence, job postings
4. Researches the founder(s): career background, domain expertise, prior company outcomes, public writing or talks
5. Synthesises all of the above into a structured **Company Intelligence Brief**

**What the Company Intelligence Brief contains:**
- Company overview (product, business model, pricing)
- Founder profile with credibility signals — each claim labelled [Verified] or [Deck-only]
- Proof points inventory — labelled by confidence level
- Differentiation map (max 4 points, critically assessed)
- Brand voice profile (formality, tone, key phrases) — constrains output register
- Gaps and weaknesses — flagged so Skill 3 can compensate

**Why it matters:** Distinguishing deck-stated claims from externally verified ones changes what gets foregrounded in the output. A metric corroborated by a news article carries different weight than one that appears only in the deck.

---

### Skill 2 — Buyer & Prospect Intelligence

Runs only when a company name is provided. Owns the demand side.

**What it does:**
1. Researches the target company across multiple dimensions (see below)
2. Researches the buyer persona based on job title and department
3. Synthesises raw research into a structured **Buyer Intelligence Brief**

**Research dimensions:**
- Company fundamentals: product, business model, headcount, funding stage
- Revenue and growth signals: funding history, hiring velocity, scale estimates
- Strategic priorities: inferred from job postings, executive hires, product launches
- Industry trends and pressures: forces shaping their sector right now (regulatory, technological, competitive)
- Recent developments: news events with implications — e.g. "new CFO hire → cost discipline push"
- Tech stack signals: inferred from job postings and integrations pages
- **Individual pain points**: specific to the buyer's role — what makes their job hard, what would make them look bad, what they wish they had more of. Ranked by career consequence, not just salience.
- **Company pain points**: organisational pains that would appear in a board deck — competitive pressure, operational drag, strategic gaps. Separate from individual pains because they require different selling language.
- Objection landscape: most probable reasons this buyer says no, specific to their company and role
- Communication style: data vs. narrative, technical vs. business-layer, formal vs. conversational

**What the Buyer Intelligence Brief contains:**
All of the above, structured as a readable intelligence document. This is the brief the user can optionally view via the "View prospect brief" button — it should read like smart analyst notes.

**Why the individual/company pain split matters:** A buyer who feels a pain personally and also recognises it as a company-level problem moves faster. The two pains require different language: individual pains speak to career outcomes and personal relief; company pains speak to strategic impact. Both need to be present in the output, but in the right places.

---

### Skill 3 — Synthesis Engine

Runs on every rewrite. Owns the transformation.

**What it does:**
Takes the Company Intelligence Brief and Buyer Intelligence Brief (when available) and produces a bespoke deck generation prompt. No external research. No API calls beyond the final Claude generation.

**Key decisions Skill 3 makes:**
- **Opening hook type:** individual pain, buying trigger, comparable proof, or industry trend — whichever the briefs suggest will land hardest for this buyer
- **Which slides to include:** only slides that earn their place for this specific buyer; unused slide types are omitted
- **Slide sequence:** structured to build momentum — hook → case → decision, not a fixed investor-deck order
- **Slide count:** 3–6, determined by what the case requires. A tight 4-slide deck is better than a padded 6-slide deck.
- **Relevance mapping:** which proof points from the Company Brief resonate most for this buyer; which to lead with, which to hold back, which to drop
- **Tone calibration:** reconciles the founder's brand voice with the buyer's communication style into a single output register

**Available slide types** (used in any combination, any order):
- Opening hook (pain / trigger / trend / proof)
- Problem or opportunity framing
- How it works (functional walkthrough)
- Proof / outcomes from comparable companies
- ROI or business case
- Why not the alternatives they currently use
- Team credibility (only if founder background addresses a trust gap)
- Pricing or commercial terms (only if a decision factor)
- Next step / CTA

---

## Features

### MVP

**1. Deck ingestion**
- Upload a deck in PDF or PPTX format
- Parse and extract text content, slide structure, and section headings
- Error on image-only decks with a clear message: re-export as PDF with selectable text

**2. Three-skill rewrite pipeline**
- Skills 1 and 2 run in parallel (async) — total research time is the slower of the two, not the sum
- Loading states stream to the user in real time: "Analysing your deck...", "Researching [Company]...", "Writing your deck..."
- Output streams as it generates — user sees text appearing, not a spinner until completion
- Bespoke slide structure per rewrite — no fixed template

**3. Prospect tailoring**
- User inputs company name (required to trigger tailoring), optional contact job title and department
- Triggers Skill 2 in full — industry trends, individual pain, company pain, recent developments
- Output is a personalised narrative anchored to this buyer's world, not a generic deck with the company name swapped in

**4. Prospect Intelligence Brief**
- After generation completes, a "View prospect brief" button appears
- Reveals the full Buyer Intelligence Brief compiled by Skill 2 — research summary, pain analysis, objection landscape
- Stored in frontend state from the SSE stream — no second API call required
- Gives founders transparency into what the tool found and why the deck was written the way it was

**5. Bulk rewrite**
- Upload a CSV or Excel file with up to 30 prospects (Customer Name, Contact Name, Job Title)
- Generates a tailored deck per prospect sequentially
- Each result is expandable inline; "Copy for Gamma" per prospect
- Uses the lighter enrichment pipeline (no Skill 2 brief synthesis) to keep bulk throughput reasonable

**6. Auth + accounts** *(next milestone — not yet built)*
- Single-user accounts via Supabase Auth (email/password; Google OAuth out of scope for MVP)
- History of generated decks
- Uploaded files deleted after 100 days

### Monetization (Freemium)

| Tier | What you get |
|---|---|
| Free | 1 generic rewrite + 1 prospect-tailored rewrite |
| Paid | Unlimited rewrites + prospect tailoring |

Pricing: **$19/month** flat. Benchmarked against Storydoc ($17–36/mo), Tome ($20/mo), and Beautiful.ai ($12/mo) — same band, narrower use case. Heavy usage triggers a bespoke contract conversation — no automated overage billing.

---

## Out of Scope (MVP)

- Fully branded, pixel-perfect PPTX output (V2 — see note below)
- Native Gamma / Google Slides / Canva integration (V2)
- Team accounts / collaboration
- CRM integrations (Salesforce, HubSpot)
- Evaluation / scoring of existing decks
- Video or audio pitch support
- Google Slides ingestion (V2 — requires OAuth + Slides API)

### V2 path — branded PPTX output

NotebookLM generates slides using its own templates; it cannot replicate the visual design of the uploaded deck. Two-stage approach planned for V2:

1. **Partial workaround (shipped in MVP):** `brand_intelligence.py` extracts colors and fonts from the uploaded deck and serialises them as plain-text instructions passed to NotebookLM's `generate_slide_deck` call. NotebookLM respects these where its template allows — imperfect but better than nothing.

2. **Full solution (V2):** Post-process the downloaded PPTX with `python-pptx`. Extract brand colors, fonts, and layout rules from the original deck; apply them programmatically to every slide in the NotebookLM output. `python-pptx` is already a backend dependency.

---

## User Flow

```
1. Sign up / log in
2. Upload investor deck (PDF / PPTX)
3. Optionally enter prospect: company name, contact title, department
4. Submit — pipeline begins:
   a. Skill 1: deck parsed + company/founder researched  ┐ parallel
   b. Skill 2: prospect researched (if company provided) ┘
   c. Skill 3: synthesis prompt built
   d. Deck generated and streamed to screen
5. User reads the output
6. [Optional] Click "View prospect brief" → see full Buyer Intelligence Brief
7. Click "Copy for Gamma" → paste into deck tool
8. [Paid] Access history of all generated decks from dashboard
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14 (TypeScript) | Deployed on Vercel |
| Backend | Python 3.11+ + FastAPI | Deployed on Railway |
| Database + Storage + Auth | Supabase | Next milestone — not yet built |
| AI | Claude API — `claude-sonnet-4-6` for generation + briefs; `claude-haiku-4-5` for fast extraction | Skills 1 and 2 each make one synthesis call; Skill 3 streams generation |
| Prospect enrichment | DuckDuckGo Search (`duckduckgo-search`) + page scraping (`httpx` + `beautifulsoup4`) | No paid API required; 10–14 targeted queries per rewrite |
| Document parsing | `python-pptx` (PPTX) + `PyMuPDF` (PDF) | |
| Streaming | Server-Sent Events (SSE) | Typed events: `status`, `text`, `brief`, `[DONE]` |
| Deployment | Vercel (frontend) + Railway (backend) | |

---

## Flipping Logic

The core intelligence of PitchFlip. Defines how investor deck content is transformed into a bespoke customer sales narrative.

### Why they're structurally different

Investor decks are built for someone who doesn't have the problem — they need to be convinced the market is large enough to matter. Customer decks are for someone who has the problem acutely — they need to be convinced this product solves it better than what they're currently doing.

The same content cannot serve both audiences. Jargon builds credibility with customers; it obscures meaning for investors. Market size signals opportunity to investors; it's irrelevant to buyers. Traction excites investors; buyers want to see proof from peers in their exact situation.

### Why the output is bespoke, not templated

The old approach — a fixed 8-slot transformation (Problem → Solution → Market Size → Traction → ...) — produces structurally correct but strategically mediocre output. A buyer whose company just closed a Series B doesn't need a problem slide; they need to see a buying trigger and an ROI case. A skeptical technical buyer needs a functional walkthrough before they'll engage with social proof.

Skill 3 makes explicit editorial decisions before writing:
1. What is the strongest opening hook for this buyer? (pain / trigger / proof / trend)
2. Which slide types are needed for this case? (unused types are omitted)
3. What sequence builds the best momentum toward a decision?
4. How many slides does this case require? (3–6, never padded)

### Language transformation rules

**Remove:** "platform", "disrupting", "paradigm shift", "end-to-end", "best-in-class", "TAM", "SAM", "SOM", "traction", "runway", "moat", "unfair advantage", all vision statements, all third-person market framing.

**Introduce:** Second-person throughout ("you", "your team"), the buyer's industry vocabulary, concrete step-by-step functionality, outcome language tied to the buyer's role and KPIs.

### Pain point hierarchy

Individual pain points (career-consequential, personal) open the narrative and create emotional pull. Company pain points (strategic, organisational) reinforce the case and justify internal budget. Industry trends contextualise why this is the right moment. All three are present in tailored output — but in this order, not treated as equivalent.

### Quality standard

The output should be immediately legible to a busy buyer who took the meeting expecting a potential solution to a real problem. They should identify their situation in the opening, understand what the product does, see why it beats their current approach, and know the next step — without being asked to care about the seller's vision, market thesis, or funding history.

### Handling missing information

Investor decks frequently lack content that customer decks require.

**Common gaps:**
- No customer stories or case studies
- Vague problem framing (market trend, not specific buyer pain)
- No pricing detail
- Abstract solution description (no functional walkthrough)
- No buyer-perspective differentiation

**Handling approach:**
Missing information is flagged inline as a clearly marked placeholder rather than silently degraded or hallucinated. Example: `[ADD: customer outcome story from a comparable company]`. The founder receives a complete structural skeleton they can fill in.

---

## Key Risks

| Risk | Status | Notes |
|---|---|---|
| Deck parsing quality varies | Open | Image-heavy or design-led decks lose context embedded in visuals. Error shown for image-only decks. |
| Research quality | Open | DuckDuckGo results vary by company size and online presence. Well-known companies enrich well; obscure or stealth startups may produce sparse briefs. |
| Research latency | Mitigated | Skills 1 and 2 run in parallel; total research time is bounded by the slower skill, not cumulative. Target: under 30s before streaming begins. |
| Prospect scraping reliability | Open | LinkedIn and some company sites block scrapers. Brief quality degrades gracefully — Claude synthesises from whatever is available. |
| Output quality | Ongoing | Heavily dependent on prompt engineering across the three skills. Needs testing across diverse deck types, industries, and buyer personas. |
| Gamma "Copy" UX | Accepted | Not a native integration — depends on Gamma's markdown import staying consistent. V2 candidate. |
| Flat monthly price | Accepted | $19/month — benchmarked against Storydoc, Tome, Beautiful.ai. |

---

## Success Metrics (MVP)

- Free → paid conversion rate
- Number of tailored decks generated per paid user per month
- Prospect brief open rate (how often users click "View prospect brief")
- User-reported output quality (thumbs up/down per output)
