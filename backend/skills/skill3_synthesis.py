"""
Skill 3: Synthesis Engine

Combines the Company Intelligence Brief and Buyer Intelligence Brief into a
single generation prompt. No external calls — pure assembly from the briefs.
"""

from pathlib import Path

PROMPTS = Path(__file__).parent.parent / "prompts"


def build_prompt(
    deck_text: str,
    company_brief: str,
    buyer_brief: str = "",
    company_name: str = "",
    contact_title: str = "",
    contact_department: str = "",
    brand_profile: str = "",
) -> str:
    """
    Returns the final deck-generation prompt ready to send to Claude.
    Uses the enriched v2 templates that consume structured briefs.
    """
    if buyer_brief and company_name:
        contact_line_parts = []
        if contact_title:
            contact_line_parts.append(f"Job title: {contact_title}")
        if contact_department:
            contact_line_parts.append(f"Department: {contact_department}")
        contact_line = "\n".join(contact_line_parts) or "No contact details provided."

        return (
            (PROMPTS / "rewrite_tailored_v2.txt")
            .read_text()
            .replace("{company_name}", company_name)
            .replace("{contact_line}", contact_line)
            .replace("{company_brief}", company_brief)
            .replace("{buyer_brief}", buyer_brief)
            .replace("{brand_profile}", brand_profile)
            .replace("{deck_content}", deck_text)
        )

    return (
        (PROMPTS / "rewrite_generic_v2.txt")
        .read_text()
        .replace("{company_brief}", company_brief)
        .replace("{brand_profile}", brand_profile)
        .replace("{deck_content}", deck_text)
    )
