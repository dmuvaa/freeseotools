"""
Brand Presence Analyzer for BlitzGeo
Handles brand detection with regex + rules approach
"""
import re
from typing import Optional, List, Dict, Any
from models import AnalysisResult, Citation


class WaterfallParser:
    """
    Implements the 'Waterfall Parsing' logic to extract citations from various AI models.
    Priorities:
    1. Metadata Extraction (Perplexity/Search response fields)
    2. Markdown Extraction (Inline links [Title](url))
    3. Reference Section Extraction (Footer text)
    """

    def __init__(self):
        # Layer 1: Metadata keys to look for in raw JSON
        self.metadata_keys = ["citations", "web_search_results", "search_results", "context"]

        # Layer 2: Markdown links [Title](URL)
        self.markdown_link_pattern = re.compile(
            r'\[([^\]]+)\]\((https?://[^\s<>"{}|\\^`]+)\)'
        )
        # Layer 2: Bare URLs
        self.url_pattern = re.compile(
            r'https?://[^\s<>"{}|\\^`\[\]]+',
            re.IGNORECASE
        )

        # Layer 3: Reference section headers
        self.reference_headers = [
            "Sources:", "References:", "Citations:", "Bibliography:", "Sources Cited:"
        ]

    def parse(self, text: str, raw_response: Optional[dict] = None) -> List[Citation]:
        """
        Main entry point for waterfall parsing.
        Returns a list of unique Citation objects.
        """
        citations: List[Citation] = []
        seen_urls = set()

        # Helper to add citation if unique
        def add_citation(url: str, source: str, context: str = ""):
            cleaned_url = url.strip().rstrip(").,")
            if cleaned_url not in seen_urls:
                seen_urls.add(cleaned_url)
                try:
                    domain = cleaned_url.split("/")[2]
                except IndexError:
                    domain = "unknown"
                
                citations.append(Citation(
                    index=len(citations) + 1,
                    url=cleaned_url,
                    domain=domain,
                    context=context,
                    source_layer=source
                ))

        # --- Layer 1: Metadata Extraction ---
        if raw_response:
            # Check standard fields in raw response
            if "citations" in raw_response and isinstance(raw_response["citations"], list):
                for url in raw_response["citations"]:
                    if isinstance(url, str):
                        add_citation(url, "metadata", "Perplexity/API citation field")
            
            # Check for choices[0].message.context (OpenAI/Perplexity sometimes put it here)
            # This logic depends on exact provider structure; can expand as needed.

        # --- Layer 2: Markdown Extraction ---
        if text:
            # Find [Title](URL)
            for match in self.markdown_link_pattern.finditer(text):
                title, url = match.groups()
                add_citation(url, "markdown", f"Linked text: {title}")

            # Find bare URLs (that weren't caught in markdown links)
            # We skip this if we want to be strict, but good for safety.
            # Simplified for now to avoid double counting if regex overlaps.
            
        # --- Layer 3: Reference Section Extraction ---
        if text:
            lower_text = text.lower()
            for header in self.reference_headers:
                header_index = lower_text.rfind(header.lower())
                if header_index != -1:
                    # Found a footer section
                    footer_text = text[header_index + len(header):]
                    footer_urls = self.url_pattern.findall(footer_text)
                    for url in footer_urls:
                        add_citation(url, "reference_section", "Footer reference")
                    # Break after finding the last section? Or continue? 
                    # Usually only one reference section exists.
                    break

        return citations


class BrandAnalyzer:
    """Analyzes AI responses for brand mentions and citations"""
    
    def __init__(self):
        self.parser = WaterfallParser()
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text for analysis:
        1. Convert to lowercase
        2. Remove markdown links but keep labels
        """
        if not text:
            return ""
        
        # Replace markdown links [Label](url) with just Label
        normalized = self.parser.markdown_link_pattern.sub(r'\1', text)
        
        # Convert to lowercase
        normalized = normalized.lower()
        
        return normalized
    
    def detect_brand_mention(
        self, 
        text: str, 
        brand_aliases: list[str]
    ) -> bool:
        """
        Check if any brand alias appears in the text.
        Uses strict matching (whole word boundaries).
        """
        if not text or not brand_aliases:
            return False
        
        normalized_text = self.normalize_text(text)
        
        for alias in brand_aliases:
            # Create word boundary pattern for alias
            alias_lower = alias.lower()
            # Escape special regex characters in alias
            escaped_alias = re.escape(alias_lower)
            # Match as whole word (with word boundaries)
            pattern = rf'\b{escaped_alias}\b'
            
            if re.search(pattern, normalized_text):
                return True
        
        return False
    
    def analyze(
        self, 
        raw_text: str, 
        brand_aliases: list[str],
        primary_domain: Optional[str] = None,
        raw_response: Optional[dict] = None
    ) -> AnalysisResult:
        """
        Full analysis of AI response.
        
        Returns:
            AnalysisResult with is_mentioned, sentiment_score, citations_found
        """
        is_mentioned = self.detect_brand_mention(raw_text, brand_aliases)
        
        # Use Waterfall Parser for citations
        citations = self.parser.parse(raw_text, raw_response)
        
        # Filter by primary domain if required? 
        # The prompt says "Ensure strict deduping", but "The Analyzer must normalize checking".
        # It doesn't explicitly say "filter out non-primary domain citations".
        # Feature A 1.2 says "Standard Output Format... context: Cited as source...". 
        # Usually we want ALL citations to see where the AI got info.
        
        sentiment_score = 0.0
        
        return AnalysisResult(
            is_mentioned=is_mentioned,
            sentiment_score=sentiment_score,
            citations_found=citations
        )


def calculate_blitz_score(mention_results: list[bool]) -> int:
    """
    Calculate Blitz Score from list of mention results.
    
    Formula: (count_mentioned / count_total) * 100
    
    Returns:
        int: Score from 0-100
    """
    if not mention_results:
        return 0
    
    mentioned_count = sum(1 for m in mention_results if m)
    total_count = len(mention_results)
    
    return int((mentioned_count / total_count) * 100)


# Singleton instance
brand_analyzer = BrandAnalyzer()
