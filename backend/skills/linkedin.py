"""
LinkedIn enrichment helper.

Uses DuckDuckGo to find LinkedIn profile/company URLs, then optionally
fetches full structured data via Proxycurl if PROXYCURL_API_KEY is set.
Degrades gracefully to DDG snippets when no API key is present.
"""

import asyncio
import os
import re

import httpx
from duckduckgo_search import DDGS

PROXYCURL_KEY = os.getenv("PROXYCURL_API_KEY", "")
PROXYCURL_BASE = "https://nubela.co/proxycurl/api"


def _ddg_find_linkedin_url(query: str) -> str | None:
    """Search DDG for a LinkedIn URL matching the query."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            for r in results:
                href = r.get("href", "")
                if "linkedin.com/in/" in href or "linkedin.com/company/" in href:
                    # Strip query params and trailing slashes
                    url = href.split("?")[0].rstrip("/")
                    return url
    except Exception:
        pass
    return None


def _ddg_snippets(query: str, max_results: int = 3) -> str:
    """Return DDG search snippets as a plain string."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return "\n".join(r["body"] for r in results if r.get("body"))
    except Exception:
        return ""


def _proxycurl_person(linkedin_url: str) -> dict | None:
    """Fetch a LinkedIn person profile via Proxycurl. Returns None on failure."""
    if not PROXYCURL_KEY:
        return None
    try:
        with httpx.Client(timeout=10) as http:
            resp = http.get(
                f"{PROXYCURL_BASE}/v2/linkedin",
                params={"linkedin_profile_url": linkedin_url, "use_cache": "if-present"},
                headers={"Authorization": f"Bearer {PROXYCURL_KEY}"},
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass
    return None


def _proxycurl_company(linkedin_url: str) -> dict | None:
    """Fetch a LinkedIn company profile via Proxycurl. Returns None on failure."""
    if not PROXYCURL_KEY:
        return None
    try:
        with httpx.Client(timeout=10) as http:
            resp = http.get(
                f"{PROXYCURL_BASE}/v2/linkedin/company",
                params={"url": linkedin_url, "use_cache": "if-present"},
                headers={"Authorization": f"Bearer {PROXYCURL_KEY}"},
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass
    return None


def _format_person_profile(data: dict) -> str:
    """Convert a Proxycurl person profile dict into readable text."""
    parts = []

    name = data.get("full_name") or data.get("first_name", "")
    headline = data.get("headline", "")
    summary = data.get("summary", "")
    location = data.get("city") or data.get("country_full_name", "")

    if name:
        parts.append(f"Name: {name}")
    if headline:
        parts.append(f"Headline: {headline}")
    if location:
        parts.append(f"Location: {location}")
    if summary:
        parts.append(f"Summary: {summary[:600]}")

    experiences = data.get("experiences", [])
    if experiences:
        exp_lines = []
        for exp in experiences[:5]:
            title = exp.get("title", "")
            company = exp.get("company", "")
            duration = exp.get("duration", "")
            description = (exp.get("description") or "")[:200]
            line = f"  - {title} at {company}"
            if duration:
                line += f" ({duration})"
            if description:
                line += f": {description}"
            exp_lines.append(line)
        parts.append("Work history:\n" + "\n".join(exp_lines))

    education = data.get("education", [])
    if education:
        edu_lines = [
            f"  - {e.get('field_of_study', '')} at {e.get('school', '')}"
            for e in education[:3]
            if e.get("school")
        ]
        if edu_lines:
            parts.append("Education:\n" + "\n".join(edu_lines))

    return "\n".join(parts)


def _format_company_profile(data: dict) -> str:
    """Convert a Proxycurl company profile dict into readable text."""
    parts = []

    name = data.get("name", "")
    description = data.get("description", "")
    industry = data.get("industry", "")
    company_type = data.get("company_type", "")
    headcount = data.get("company_size_on_linkedin")
    founded = data.get("founded_year")
    specialities = data.get("specialities", [])
    hq = data.get("hq", {})

    if name:
        parts.append(f"Company: {name}")
    if industry:
        parts.append(f"Industry: {industry}")
    if company_type:
        parts.append(f"Type: {company_type}")
    if headcount:
        parts.append(f"LinkedIn headcount: {headcount}")
    if founded:
        parts.append(f"Founded: {founded}")
    if hq:
        city = hq.get("city", "")
        country = hq.get("country", "")
        if city or country:
            parts.append(f"HQ: {city}, {country}".strip(", "))
    if description:
        parts.append(f"Description: {description[:600]}")
    if specialities:
        parts.append(f"Specialities: {', '.join(specialities[:10])}")

    return "\n".join(parts)


def _lookup_person_sync(name: str, company_name: str) -> str:
    """Synchronous LinkedIn person lookup. Called via asyncio.to_thread."""
    # 1. Find the LinkedIn profile URL via DDG
    url = _ddg_find_linkedin_url(f'"{name}" "{company_name}" site:linkedin.com/in/')
    if not url:
        # Broader fallback search
        url = _ddg_find_linkedin_url(f"{name} {company_name} LinkedIn profile")

    # 2. Try Proxycurl if key is available and we have a URL
    if url and PROXYCURL_KEY:
        profile = _proxycurl_person(url)
        if profile:
            return f"[LinkedIn – Proxycurl]\n{_format_person_profile(profile)}"

    # 3. Fall back to DDG snippets
    snippets = _ddg_snippets(f"{name} {company_name} LinkedIn background career", max_results=3)
    if snippets:
        source = f"LinkedIn URL: {url}" if url else "LinkedIn URL: not found"
        return f"[LinkedIn – DDG snippets]\n{source}\n{snippets}"

    return ""


def _lookup_company_sync(company_name: str) -> str:
    """Synchronous LinkedIn company lookup. Called via asyncio.to_thread."""
    # 1. Find the LinkedIn company URL via DDG
    url = _ddg_find_linkedin_url(f'"{company_name}" site:linkedin.com/company/')
    if not url:
        url = _ddg_find_linkedin_url(f"{company_name} LinkedIn company page")

    # 2. Try Proxycurl if key is available and we have a URL
    if url and PROXYCURL_KEY:
        profile = _proxycurl_company(url)
        if profile:
            return f"[LinkedIn Company – Proxycurl]\n{_format_company_profile(profile)}"

    # 3. Fall back to DDG snippets about the company on LinkedIn
    snippets = _ddg_snippets(f"{company_name} LinkedIn employees team headcount", max_results=2)
    if snippets:
        source = f"LinkedIn URL: {url}" if url else "LinkedIn URL: not found"
        return f"[LinkedIn Company – DDG snippets]\n{source}\n{snippets}"

    return ""


async def lookup_person(name: str, company_name: str) -> str:
    """Async wrapper — LinkedIn profile for a named individual."""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_lookup_person_sync, name, company_name),
            timeout=15.0,
        )
    except Exception:
        return ""


async def lookup_company(company_name: str) -> str:
    """Async wrapper — LinkedIn company page."""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_lookup_company_sync, company_name),
            timeout=15.0,
        )
    except Exception:
        return ""
