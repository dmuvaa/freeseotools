"""
AI Index Knowledge Graph Worker

Executes 5 probe classes to reverse-engineer the retrievable content surface
that AI models rely on when answering questions about a brand.
"""
import asyncio
import json
import re
from collections import Counter
from typing import Optional
from urllib.parse import urlparse

from supabase import Client

from models import JobPayload, IndexAuditResult, IndexedDomain, ConceptAnchor, Conflict
from openrouter import openrouter_client
from logger import log_info, log_error, log_debug


class IndexGraphWorker:
    """
    Executes AI Index probes and aggregates results into an Index Snapshot.
    """

    # Number of times to run each probe for stability
    PROBE_RUNS = 3

    # Probe prompt templates
    PROMPTS = {
        "recall_boundary": """You are acting as a search system.
List the sources you would consult to answer:
"{brand} {query}".

Return only URLs. No explanation. One URL per line.""",

        "dominance": """When answering questions about {brand},
which single source most strongly influences your response?
Return domain only. Example: example.com""",

        "concept_anchor": """List the exact phrases most commonly associated with {brand}
in retrieved documents.
Return short noun phrases only. One per line. Maximum 10.""",

        "negative_space": """What important information about {brand} is missing or weakly supported
in the sources you retrieve?
Return bullet points only. Maximum 5.""",

        "conflict": """Do retrieved sources about {brand} disagree on any material facts?
List only the conflicting claims.
Format: "attribute: description of conflict"
Maximum 5 conflicts."""
    }

    async def execute(self, job: JobPayload, db: Client):
        """
        Main execution entry point.
        Runs all 5 probe classes and aggregates into an IndexAuditResult.
        """
        brand = job.brand_aliases[0] if job.brand_aliases else "the brand"
        model = job.models[0] if job.models else "perplexity/sonar-reasoning"
        query = job.query_phrase or "services and products"

        log_info("index_graph", f"Starting Index Audit for '{brand}'", {
            "project_id": job.project_id,
            "model": model
        })

        # Execute all probes in parallel
        results = await asyncio.gather(
            self._run_recall_boundary_probe(brand, query, model),
            self._run_dominance_probe(brand, model),
            self._run_concept_anchor_probe(brand, model),
            self._run_negative_space_probe(brand, model),
            self._run_conflict_probe(brand, model),
            return_exceptions=True
        )

        # Process results
        recall_urls = results[0] if not isinstance(results[0], Exception) else []
        dominant_domain = results[1] if not isinstance(results[1], Exception) else None
        anchors = results[2] if not isinstance(results[2], Exception) else []
        missing = results[3] if not isinstance(results[3], Exception) else []
        conflicts = results[4] if not isinstance(results[4], Exception) else []

        # Aggregate domain frequencies
        indexed_domains = self._aggregate_domains(recall_urls)

        # Compute scores
        dominance_score = self._compute_dominance_score(indexed_domains)
        stability_score = self._compute_stability_score(indexed_domains, conflicts)

        # Build result
        result = IndexAuditResult(
            dominant_domain=dominant_domain,
            dominance_score=dominance_score,
            indexed_domains=indexed_domains,
            concept_anchors=anchors,
            missing_entities=missing,
            conflicts=conflicts,
            index_stability_score=stability_score
        )

        # Save to database
        await self._save_result(db, job.project_id, model, result)

        log_info("index_graph", f"Index Audit complete", {
            "project_id": job.project_id,
            "domains_found": len(indexed_domains),
            "stability_score": stability_score
        })

        return result

    async def _query_ai(self, prompt: str, model: str) -> Optional[str]:
        """Query AI model with a prompt."""
        try:
            messages = [
                {"role": "system", "content": "You are a retrieval analysis assistant. Follow instructions precisely. Be concise."},
                {"role": "user", "content": prompt}
            ]
            result = await openrouter_client.query(model, messages)
            return result.get("content")
        except Exception as e:
            log_error("index_graph", f"AI query failed: {e}")
            return None

    async def _run_recall_boundary_probe(self, brand: str, query: str, model: str) -> list[str]:
        """Run recall boundary probe multiple times and aggregate URLs."""
        all_urls = []
        prompt_template = self.PROMPTS["recall_boundary"]

        for i in range(self.PROBE_RUNS):
            # Slight variation in prompt
            prompt = prompt_template.format(brand=brand, query=query)
            if i > 0:
                prompt = prompt.replace("List the sources", f"List {3 + i} sources")

            response = await self._query_ai(prompt, model)
            if response:
                urls = self._extract_urls(response)
                all_urls.extend(urls)

        log_debug("index_graph", f"Recall probe found {len(all_urls)} URLs across {self.PROBE_RUNS} runs")
        return all_urls

    async def _run_dominance_probe(self, brand: str, model: str) -> Optional[str]:
        """Run dominance probe to find most influential domain."""
        prompt = self.PROMPTS["dominance"].format(brand=brand)
        responses = []

        for _ in range(self.PROBE_RUNS):
            response = await self._query_ai(prompt, model)
            if response:
                # Extract domain from response
                domain = self._extract_domain(response)
                if domain:
                    responses.append(domain)

        # Return most common domain
        if responses:
            counter = Counter(responses)
            return counter.most_common(1)[0][0]
        return None

    async def _run_concept_anchor_probe(self, brand: str, model: str) -> list[ConceptAnchor]:
        """Run concept anchor probe to extract semantic anchors."""
        prompt = self.PROMPTS["concept_anchor"].format(brand=brand)
        all_phrases = []

        for _ in range(self.PROBE_RUNS):
            response = await self._query_ai(prompt, model)
            if response:
                # Extract phrases (one per line)
                phrases = [p.strip().strip('-•').strip() for p in response.split('\n') if p.strip()]
                all_phrases.extend(phrases[:10])  # Limit per run

        # Aggregate and weight by frequency
        counter = Counter(all_phrases)
        total = sum(counter.values())
        anchors = [
            ConceptAnchor(phrase=phrase, weight=round(count / total, 2))
            for phrase, count in counter.most_common(10)
        ]
        return anchors

    async def _run_negative_space_probe(self, brand: str, model: str) -> list[str]:
        """Run negative space probe to detect missing information."""
        prompt = self.PROMPTS["negative_space"].format(brand=brand)
        all_missing = []

        for _ in range(self.PROBE_RUNS):
            response = await self._query_ai(prompt, model)
            if response:
                # Extract bullet points
                items = [
                    line.strip().lstrip('-•*').strip()
                    for line in response.split('\n')
                    if line.strip() and not line.strip().startswith('#')
                ]
                all_missing.extend(items[:5])

        # Deduplicate
        seen = set()
        unique = []
        for item in all_missing:
            key = item.lower()[:50]
            if key not in seen:
                seen.add(key)
                unique.append(item)

        return unique[:10]

    async def _run_conflict_probe(self, brand: str, model: str) -> list[Conflict]:
        """Run conflict probe to detect index instability."""
        prompt = self.PROMPTS["conflict"].format(brand=brand)
        all_conflicts = []

        for _ in range(self.PROBE_RUNS):
            response = await self._query_ai(prompt, model)
            if response:
                # Parse "attribute: description" format
                for line in response.split('\n'):
                    if ':' in line:
                        parts = line.split(':', 1)
                        attribute = parts[0].strip().lstrip('-•*').strip()
                        description = parts[1].strip() if len(parts) > 1 else ""
                        if attribute:
                            # Determine variance based on description
                            variance = "medium"
                            if any(w in description.lower() for w in ["major", "significant", "critical"]):
                                variance = "high"
                            elif any(w in description.lower() for w in ["minor", "slight", "small"]):
                                variance = "low"
                            all_conflicts.append(Conflict(attribute=attribute, variance=variance))

        # Deduplicate by attribute
        seen = set()
        unique = []
        for c in all_conflicts:
            if c.attribute.lower() not in seen:
                seen.add(c.attribute.lower())
                unique.append(c)

        return unique[:5]

    def _extract_urls(self, text: str) -> list[str]:
        """Extract URLs from text."""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        urls = re.findall(url_pattern, text)
        # Clean up trailing punctuation
        return [url.rstrip('.,;:)') for url in urls]

    def _extract_domain(self, text: str) -> Optional[str]:
        """Extract domain from text."""
        # First try to find a URL
        urls = self._extract_urls(text)
        if urls:
            try:
                return urlparse(urls[0]).netloc
            except:
                pass

        # Try to extract domain pattern
        domain_pattern = r'([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}'
        match = re.search(domain_pattern, text)
        if match:
            return match.group(0).lower()

        return None

    def _aggregate_domains(self, urls: list[str]) -> list[IndexedDomain]:
        """Aggregate URLs into weighted domain list."""
        domains = []
        for url in urls:
            try:
                domain = urlparse(url).netloc
                if domain:
                    domains.append(domain.lower())
            except:
                pass

        counter = Counter(domains)
        total = sum(counter.values()) or 1

        return [
            IndexedDomain(domain=domain, weight=round(count / total, 2))
            for domain, count in counter.most_common(15)
        ]

    def _compute_dominance_score(self, domains: list[IndexedDomain]) -> float:
        """
        Compute dominance score (how concentrated retrieval is).
        High dominance = few domains control retrieval.
        """
        if not domains:
            return 0.0

        weights = [d.weight for d in domains]
        # Herfindahl-Hirschman Index style
        hhi = sum(w ** 2 for w in weights)
        # Normalize to 0-1 scale
        return round(min(hhi * 2, 1.0), 2)

    def _compute_stability_score(self, domains: list[IndexedDomain], conflicts: list[Conflict]) -> float:
        """
        Compute stability score based on:
        - Domain diversity
        - Conflict count
        """
        base_score = 1.0

        # Penalize for conflicts
        high_conflicts = sum(1 for c in conflicts if c.variance == "high")
        med_conflicts = sum(1 for c in conflicts if c.variance == "medium")
        base_score -= (high_conflicts * 0.15) + (med_conflicts * 0.08)

        # Penalize for extreme dominance (single source risk)
        if domains and domains[0].weight > 0.6:
            base_score -= 0.1

        return round(max(0.0, min(1.0, base_score)), 2)

    async def _save_result(self, db: Client, project_id: str, model: str, result: IndexAuditResult):
        """Save the Index Audit result to database."""
        try:
            db.table("index_audits").insert({
                "project_id": project_id,
                "model": model,
                "dominant_domain": result.dominant_domain,
                "dominance_score": result.dominance_score,
                "indexed_domains": [d.model_dump() for d in result.indexed_domains],
                "concept_anchors": [a.model_dump() for a in result.concept_anchors],
                "missing_entities": result.missing_entities,
                "conflicts": [c.model_dump() for c in result.conflicts],
                "index_stability_score": result.index_stability_score
            }).execute()
            log_info("index_graph", "Result saved to index_audits")
        except Exception as e:
            log_error("index_graph", f"Failed to save result: {e}")


# Singleton instance
index_graph_worker = IndexGraphWorker()
