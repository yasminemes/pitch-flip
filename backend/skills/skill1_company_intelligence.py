"""
Skill 1: Company & Founder Intelligence

Extracts structured intelligence from the uploaded deck and cross-references it
with external research on the company and founder. Returns a Company Intelligence
Brief as a markdown string.
"""

import asyncio
import json
from pathlib import Path

import httpx
from anthropic import Anthropic
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

from skills import linkedin as li

PROMPTS = Path(__file__).parent.parent / "prompts"


def _domain(url: str) -> str:
    try:
        return url.split("/")[2].removeprefix("www.")
    except Exception:
        return ""


def _run_research(queries: list[tuple[str, int]], scrape_urls: list[str] | None = None) -> str:
    """Execute DDG searches and optionally scrape specific URLs. Runs in a thread."""
    parts = []

    try:
        with DDGS() as ddgs:
            for query, max_results in queries:
                try:
                    results = list(ddgs.text(query, max_results=max_results))
                    if results:
                        snippets = "\n".join(
                            f"- {r['body']}" + (f" [{_domain(r['href'])}]" if r.get("href") else "")
                            for r in results if r.get("body")
                        )
                        parts.append(f"[{query}]\n{snippets}")

                        # Scrape the top result URL from this query
                        if scrape_urls is not None and results[0].get("href"):
                            scrape_urls.append(results[0]["href"])
                except Exception:
                    continue
    except Exception:
        pass

    # Scrape up to 2 URLs
    if scrape_urls:
        with httpx.Client(timeout=8, follow_redirects=True) as http:
            for url in scrape_urls[:2]:
                try:
                    resp = http.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    soup = BeautifulSoup(resp.text, "html.parser")
                    for tag in soup(["script", "style", "nav", "footer", "header"]):
                        tag.decompose()
                    page_text = soup.get_text(separator=" ", strip=True)[:2500]
                    if page_text:
                        parts.append(f"[Page content from {url}]\n{page_text}")
                except Exception:
                    continue

    return "\n\n".join(parts)


async def _extract_deck_meta(deck_text: str, client: Anthropic) -> dict:
    """Quick Claude call to pull company name and founder names from the deck."""
    response = await asyncio.to_thread(
        client.messages.create,
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": (
                "From this pitch deck extract:\n"
                "1. The company name\n"
                "2. Founder name(s) if mentioned\n"
                "3. The product in one sentence\n\n"
                'Respond ONLY with JSON: {"company_name": "", "founder_names": [], "product_summary": ""}\n\n'
                f"Deck content (first 3000 chars):\n{deck_text[:3000]}"
            ),
        }],
    )
    try:
        return json.loads(response.content[0].text)
    except Exception:
        return {"company_name": "", "founder_names": [], "product_summary": ""}


async def run(deck_text: str, client: Anthropic) -> str:
    """
    Returns a Company Intelligence Brief (markdown string).
    Always runs — even when no prospect is provided.
    """
    meta = await _extract_deck_meta(deck_text, client)
    company_name: str = meta.get("company_name", "")
    founder_names: list[str] = meta.get("founder_names", [])

    research_parts: list[str] = []

    # Company research
    if company_name:
        urls_to_scrape: list[str] = []
        company_queries = [
            (f"{company_name} company product what they do", 3),
            (f"{company_name} funding investors Crunchbase AngelList", 2),
            (f"{company_name} news 2024 2025", 2),
            (f"{company_name} customers case studies testimonials", 2),
            (f"{company_name} jobs hiring current openings", 2),
        ]
        raw = await asyncio.wait_for(
            asyncio.to_thread(_run_research, company_queries, urls_to_scrape),
            timeout=25.0,
        )
        if raw:
            research_parts.append(f"## Company Research: {company_name}\n\n{raw}")

    # Founder research (parallel across founders, capped at 2)
    async def _founder_research(name: str) -> str:
        queries = [
            (f"{name} founder {company_name} background career", 2),
            (f"{name} startup founder past companies", 2),
        ]
        web_raw, linkedin_raw = await asyncio.gather(
            asyncio.wait_for(asyncio.to_thread(_run_research, queries, None), timeout=15.0),
            li.lookup_person(name, company_name),
            return_exceptions=True,
        )
        parts = []
        if isinstance(web_raw, str) and web_raw:
            parts.append(web_raw)
        if isinstance(linkedin_raw, str) and linkedin_raw:
            parts.append(linkedin_raw)
        combined = "\n\n".join(parts)
        return f"## Founder Research: {name}\n\n{combined}" if combined else ""

    if founder_names:
        founder_results = await asyncio.gather(
            *[_founder_research(name) for name in founder_names[:2]],
            return_exceptions=True,
        )
        for result in founder_results:
            if isinstance(result, str) and result:
                research_parts.append(result)

    raw_research = "\n\n---\n\n".join(research_parts) or "No external research found."

    # Synthesise into a structured Company Intelligence Brief
    prompt = (
        (PROMPTS / "company_brief.txt")
        .read_text()
        .replace("{deck_content}", deck_text)
        .replace("{raw_research}", raw_research)
    )

    response = await asyncio.to_thread(
        client.messages.create,
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text
