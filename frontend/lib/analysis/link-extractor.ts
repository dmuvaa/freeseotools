import * as cheerio from 'cheerio';
import { JSLinkMetrics, LinkNode, LinkEdge } from './types';

interface LinkData {
    href: string;
    text: string;
    rel?: string;
    location: 'nav' | 'header' | 'footer' | 'body' | 'unknown';
}

export class LinkExtractor {
    normalizeUrl(href: string, baseUrl: string): string | null {
        try {
            const fullUrl = new URL(href, baseUrl);

            // Simple normalization: remove hash, keep everything else
            fullUrl.hash = '';

            // Ensure it's http/https
            if (!['http:', 'https:'].includes(fullUrl.protocol)) {
                return null;
            }

            return fullUrl.href;
        } catch (e) {
            return null;
        }
    }

    isInternal(url: string, baseDomain: string): boolean {
        try {
            const targetUrl = new URL(url);
            const baseUrl = new URL(baseDomain);
            return targetUrl.hostname === baseUrl.hostname || targetUrl.hostname.endsWith(`.${baseUrl.hostname}`);
        } catch (e) {
            return false;
        }
    }

    extractLinks(html: string, baseUrl: string): LinkData[] {
        const $ = cheerio.load(html);
        const links: LinkData[] = [];

        $('a').each((_, element) => {
            const $el = $(element);
            const href = $el.attr('href');

            if (href) {
                // Determine location
                let location: LinkData['location'] = 'unknown';
                if ($el.closest('nav').length > 0) location = 'nav';
                else if ($el.closest('header').length > 0) location = 'header';
                else if ($el.closest('footer').length > 0) location = 'footer';
                else if ($el.closest('body').length > 0) location = 'body';

                links.push({
                    href,
                    text: $el.text().trim(),
                    rel: $el.attr('rel'),
                    location,
                });
            }
        });

        return links;
    }

    analyze(htmlJs: string, htmlNoJs: string, baseUrl: string): { metrics: JSLinkMetrics, nodes: LinkNode[], edges: LinkEdge[], jsOnlyLinks: string[] } {
        const jsLinksRaw = this.extractLinks(htmlJs, baseUrl);
        const noJsLinksRaw = this.extractLinks(htmlNoJs, baseUrl);

        // Filter and Normalize
        const processLinks = (raw: LinkData[]) => {
            const valid = new Set<string>();
            const details = new Map<string, LinkData[]>();

            raw.forEach(link => {
                const normalized = this.normalizeUrl(link.href, baseUrl);
                if (normalized && this.isInternal(normalized, baseUrl)) {
                    valid.add(normalized);
                    if (!details.has(normalized)) details.set(normalized, []);
                    details.get(normalized)?.push(link);
                }
            });
            return { valid, details };
        };

        const jsProcessed = processLinks(jsLinksRaw);
        const noJsProcessed = processLinks(noJsLinksRaw);

        const allInternalLinks = jsProcessed.valid;
        const noJsInternalLinks = noJsProcessed.valid;

        // Identify JS-only links
        const jsOnlyLinks: string[] = [];
        allInternalLinks.forEach(url => {
            if (!noJsInternalLinks.has(url)) {
                jsOnlyLinks.push(url);
            }
        });

        // Calculate Metrics
        const totalLinks = jsLinksRaw.filter(l => {
            const n = this.normalizeUrl(l.href, baseUrl);
            return n && this.isInternal(n, baseUrl);
        }).length;

        let navCount = 0;
        let bodyCount = 0;
        let footerCount = 0;
        let noFollowCount = 0;
        let emptyAnchorCount = 0;
        let totalAnchorLength = 0;

        jsLinksRaw.forEach(link => {
            const n = this.normalizeUrl(link.href, baseUrl);
            if (n && this.isInternal(n, baseUrl)) {
                if (link.location === 'nav') navCount++;
                if (link.location === 'body') bodyCount++;
                if (link.location === 'footer') footerCount++;
                if (link.rel?.includes('nofollow')) noFollowCount++;
                if (!link.text) emptyAnchorCount++;
                else totalAnchorLength += link.text.length;
            }
        });

        const uniqueInternalLinks = allInternalLinks.size;

        return {
            metrics: {
                totalLinks,
                uniqueInternalLinks,
                jsOnlyLinks: jsOnlyLinks.length,
                jsDependencyPercent: uniqueInternalLinks > 0 ? (jsOnlyLinks.length / uniqueInternalLinks) * 100 : 0,
                navLinkCount: navCount,
                bodyLinkCount: bodyCount,
                footerLinkCount: footerCount,
                noFollowCount,
                emptyAnchorCount,
                avgAnchorTextLength: totalLinks > 0 ? totalAnchorLength / totalLinks : 0,
            },
            nodes: [
                { id: baseUrl, type: 'internal', depth: 0 }, // Root node
                ...Array.from(allInternalLinks).filter(url => url !== baseUrl).map(url => ({ id: url, type: 'internal' as const, depth: 1 }))
            ],
            edges: Array.from(allInternalLinks).filter(url => url !== baseUrl).map(target => ({ source: baseUrl, target })),
            jsOnlyLinks
        };
    }
}
