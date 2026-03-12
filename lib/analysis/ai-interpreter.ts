import * as cheerio from 'cheerio';
import { AIInterpretation } from './types';

export class AIInterpreter {
    analyze(html: string): AIInterpretation {
        const $ = cheerio.load(html);

        // 1. Content Extraction
        const title = $('title').text().trim();
        const h1 = $('h1').first().text().trim();
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

        // 2. Schema Extraction
        const schemas: any[] = [];
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).html() || '{}');
                schemas.push(json);
            } catch (e) {
                // ignore invalid json
            }
        });

        // 3. Heuristic Topic Detection (Naive)
        // In a real app, this might use TF-IDF or a more complex NLP lib, keeping it simple here
        const topic = this.detectTopic(title, h1, metaDesc);

        // 4. Entity Detection
        const entity = this.detectEntity(schemas, title);

        // 5. Intent Classification
        const intent = this.classifyIntent(schemas, title, h1, bodyText);

        // 6. Clarity Score
        const clarity = this.calculateClarityScore({
            hasTitle: !!title,
            hasH1: !!h1,
            hasMetaDesc: !!metaDesc,
            hasSchema: schemas.length > 0,
            titleMatchesH1: title.includes(h1) || h1.includes(title),
            contentLength: bodyText.length
        });

        return {
            primary_topic: topic,
            detected_entity: entity.name,
            entity_type: entity.type,
            intent,
            clarity_score: clarity.score,
            confidence_level: clarity.level,
            weaknesses: clarity.weaknesses,
            qualitative_assessment: clarity.score > 80 ? "Excellent signal clarity" : clarity.score > 50 ? "Moderate signal clarity" : "Poor signal clarity",
            topic_relevance: clarity.score > 80 ? "Focused" : clarity.score > 50 ? "Diluted" : "Scattered"
        };
    }

    private detectTopic(title: string, h1: string, desc: string): string {
        // Very naive: find most common significant word in title/h1
        const text = `${title} ${h1} ${desc}`.toLowerCase();
        const words = text.match(/\b\w{4,}\b/g) || [];
        const freq: Record<string, number> = {};

        words.forEach(w => {
            if (['with', 'this', 'that', 'from', 'about', 'your', 'their'].includes(w)) return;
            freq[w] = (freq[w] || 0) + 1;
        });

        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : 'General';
    }

    private detectEntity(schemas: any[], title: string): { name: string, type: string } {
        // Check schema first
        for (const s of schemas) {
            const type = Array.isArray(s['@type']) ? s['@type'][0] : s['@type'];
            if (['Organization', 'Person', 'Product', 'LocalBusiness'].includes(type) && s.name) {
                return { name: s.name, type: type };
            }
        }

        // Fallback
        return { name: 'Unknown', type: 'Unknown' };
    }

    private classifyIntent(schemas: any[], title: string, h1: string, body: string): AIInterpretation['intent'] {
        const text = `${title} ${h1}`.toLowerCase();

        // Check for Product schema -> usually Commercial or Transactional
        const hasProduct = schemas.some(s => s['@type'] === 'Product' || s['@type'] === 'Offer');
        if (hasProduct) return 'Transactional';

        if (text.includes('buy') || text.includes('price') || text.includes('shop')) return 'Transactional';
        if (text.includes('best') || text.includes('review') || text.includes('vs')) return 'Commercial';
        if (text.includes('how to') || text.includes('what is') || text.includes('guide')) return 'Informational';

        return 'Informational'; // Default
    }

    private calculateClarityScore(metrics: {
        hasTitle: boolean, hasH1: boolean, hasMetaDesc: boolean,
        hasSchema: boolean, titleMatchesH1: boolean, contentLength: number
    }): { score: number, level: 'low' | 'medium' | 'high', weaknesses: string[] } {
        let score = 0;
        const weaknesses: string[] = [];

        if (metrics.hasTitle) score += 20; else weaknesses.push('Missing Title');
        if (metrics.hasH1) score += 20; else weaknesses.push('Missing H1');
        if (metrics.hasMetaDesc) score += 15; else weaknesses.push('Missing Meta Description');
        if (metrics.hasSchema) score += 25; else weaknesses.push('No Schema Markup');
        if (metrics.titleMatchesH1) score += 10; else weaknesses.push('Title/H1 Mismatch');
        if (metrics.contentLength > 300) score += 10; else weaknesses.push('Thin Content');

        let level: 'low' | 'medium' | 'high' = 'low';
        if (score > 80) level = 'high';
        else if (score > 50) level = 'medium';

        return { score, level, weaknesses };
    }
}
