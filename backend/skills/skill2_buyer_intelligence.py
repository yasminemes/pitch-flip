"""
Skill 2: Buyer & Prospect Intelligence

Researches the target company and buyer persona using external sources.
Returns a Buyer Intelligence Brief as a markdown string.
Only runs when company_name is provided.
"""

import asyncio
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
    """Execute DDG searches and optionally scrape the top result URLs. Runs in a thread."""
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

                        if scrape_urls is not None and results[0].get("href"):
                            scrape_urls.append(results[0]["href"])
                except Exception:
                    continue
    except Exception:
        pass

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


async def run(
    company_name: str,
    contact_title: str = "",
    contact_department: str = "",
    client: Anthropic = None,
) -> str:
    """
    Returns a Buyer Intelligence Brief (markdown string).
    Only called when company_name is provided.
    """
    urls_to_scrape: list[str] = []

    queries = [
        # Company fundamentals
        (f"{company_name} company what they do product overview", 3),
        (f"{company_name} revenue funding stage headcount size", 2),
        (f"{company_name} news 2024 2025 announcements strategy", 3),
        (f"{company_name} hiring jobs current openings initiatives", 2),
        (f"{company_name} technology stack tools integrations", 2),
        (f"{company_name} competitors challenges market position", 2),
        # Industry trends — surfaced through the company's context
        (f"{company_name} industry trends challenges 2024 2025", 2),
        (f"{company_name} sector technology transformation disruption", 2),
    ]

    if contact_title:
        # Individual pain and persona research
        queries.append((f'"{contact_title}" biggest challenges pain points 2024 2025', 2))
        queries.append((f'"{contact_title}" KPIs metrics how success is measured', 2))
        queries.append((f'"{contact_title}" day to day problems frustrations', 2))
        queries.append((f"{company_name} {contact_title} responsibilities", 1))

    web_research, linkedin_company = await asyncio.gather(
        asyncio.wait_for(asyncio.to_thread(_run_research, queries, urls_to_scrape), timeout=30.0),
        li.lookup_company(company_name),
        return_exceptions=True,
    )

    raw_research_parts = []
    if isinstance(web_research, str) and web_research:
        raw_research_parts.append(web_research)
    if isinstance(linkedin_company, str) and linkedin_company:
        raw_research_parts.append(linkedin_company)
    raw_research = "\n\n---\n\n".join(raw_research_parts) or "No external research found."

    contact_context = ""
    if contact_title:
        contact_context += f"Contact title: {contact_title}"
    if contact_department:
        contact_context += f"\nDepartment: {contact_department}"
    if not contact_context:
        contact_context = "No specific contact provided — write for a senior decision-maker."

    prompt = (
        (PROMPTS / "buyer_brief.txt")
        .read_text()
        .replace("{company_name}", company_name)
        .replace("{contact_context}", contact_context)
        .replace("{raw_research}", raw_research or "No external research found.")
    )

    response = await asyncio.to_thread(
        client.messages.create,
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text
