
import sys
import os
import json
import unittest

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from analyzer import WaterfallParser
from models import Citation

class TestWaterfallParser(unittest.TestCase):
    def setUp(self):
        self.parser = WaterfallParser()

    def test_layer1_metadata(self):
        """Test extraction from raw response metadata (Perplexity style)"""
        raw_response = {
            "citations": [
                "https://example.com/source1",
                "https://news.com/article"
            ]
        }
        text = "Here is some text."
        citations = self.parser.parse(text, raw_response)
        
        self.assertEqual(len(citations), 2)
        self.assertEqual(citations[0].url, "https://example.com/source1")
        self.assertEqual(citations[0].source_layer, "metadata")

    def test_layer2_markdown(self):
        """Test extraction from markdown links (GPT style)"""
        text = "According to [The Verge](https://theverge.com/news), the product is great."
        citations = self.parser.parse(text, None)
        
        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0].url, "https://theverge.com/news")
        self.assertEqual(citations[0].source_layer, "markdown")
        self.assertIn("The Verge", citations[0].context)

    def test_layer3_footer(self):
        """Test extraction from footer references (Gemini style)"""
        text = """
        The sky is blue.
        
        Sources:
        1. https://wikipedia.org/wiki/Sky
        """
        citations = self.parser.parse(text, None)
        
        self.assertEqual(len(citations), 1)
        self.assertEqual(citations[0].url, "https://wikipedia.org/wiki/Sky")
        self.assertEqual(citations[0].source_layer, "reference_section")

    def test_deduplication(self):
        """Test strict deduplication across layers"""
        text = "See [Link](https://example.com/same)"
        raw_response = {
            "citations": ["https://example.com/same"]
        }
        citations = self.parser.parse(text, raw_response)
        
        self.assertEqual(len(citations), 1)
        # Should populate from raw response first (Layer 1) or maintain order?
        # My logic adds from Metadata first, then Markdown. 
        # So it should be "metadata" source if strict deduping keeps first occurrence.
        self.assertEqual(citations[0].url, "https://example.com/same")
        self.assertEqual(citations[0].source_layer, "metadata")

if __name__ == '__main__':
    unittest.main()
