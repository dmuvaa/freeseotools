import re

class Citation:
    def __init__(self, index, url, domain, context, source_layer):
        self.index = index
        self.url = url
        self.domain = domain
        self.context = context
        self.source_layer = source_layer
    
    def __repr__(self):
        return f"Citation(url='{self.url}', source='{self.source_layer}')"

class WaterfallParser:
    def __init__(self):
        self.metadata_keys = ["citations", "web_search_results", "search_results", "context"]
        self.markdown_link_pattern = re.compile(r'\[([^\]]+)\]\((https?://[^\s<>"{}|\\^`]+)\)')
        self.url_pattern = re.compile(r'https?://[^\s<>"{}|\\^`\[\]]+', re.IGNORECASE)
        self.reference_headers = ["Sources:", "References:", "Citations:", "Bibliography:", "Sources Cited:"]

    def parse(self, text):
        citations = []
        seen_urls = set()

        def add_citation(url, source, context=""):
            cleaned_url = url.strip().rstrip(").,")
            if cleaned_url not in seen_urls:
                seen_urls.add(cleaned_url)
                try:
                    domain = cleaned_url.split("/")[2]
                except IndexError:
                    domain = "unknown"
                citations.append(Citation(len(citations) + 1, cleaned_url, domain, context, source))

        # Layer 2: Markdown
        if text:
            for match in self.markdown_link_pattern.finditer(text):
                title, url = match.groups()
                add_citation(url, "markdown", f"Linked text: {title}")

        # Layer 3: References
        if text:
            lower_text = text.lower()
            for header in self.reference_headers:
                header_index = lower_text.rfind(header.lower())
                if header_index != -1:
                    footer_text = text[header_index + len(header):]
                    footer_urls = self.url_pattern.findall(footer_text)
                    for url in footer_urls:
                        add_citation(url, "reference_section", "Footer reference")
                    break
        
        return citations

def test_citations():
    parser = WaterfallParser()
    
    markdown_text = """
    Here is a [Google Link](https://google.com/search?q=test) embedded in text.
    And another [Bing Link](https://bing.com).
    """
    
    footer_text = """
    Some answer.
    
    Sources:
    1. https://source1.com/article
    2. https://source2.org/paper
    """
    
    mixed_text = """
    According to [Wikipedia](https://en.wikipedia.org/wiki/SaaS), software is good.
    
    References:
    * https://techcrunch.com/saas
    """

    print("--- Test 1: Markdown ---")
    c1 = parser.parse(markdown_text)
    for c in c1: print(c)

    print("\n--- Test 2: Footer ---")
    c2 = parser.parse(footer_text)
    for c in c2: print(c)

    print("\n--- Test 3: Mixed ---")
    c3 = parser.parse(mixed_text)
    for c in c3: print(c)

if __name__ == "__main__":
    test_citations()
