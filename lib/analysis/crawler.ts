import chromium from "@sparticuz/chromium";
import puppeteer, { Browser } from "puppeteer-core";
import { getLaunchOptions } from "./browser-config";

interface FetchResult {
    html: string;
    status: number;
    url: string; // The final URL after redirects
}

export class Crawler {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            const options = await getLaunchOptions();
            this.browser = await puppeteer.launch(options);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async fetchPage(url: string, jsEnabled: boolean = true): Promise<FetchResult> {
        if (!this.browser) await this.init();

        const page = await this.browser!.newPage();

        // Standard user agent for SEO tools
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        if (!jsEnabled) {
            await page.setJavaScriptEnabled(false);
        }

        // Block heavy resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        try {
            const response = await page.goto(url, {
                waitUntil: jsEnabled ? 'networkidle2' : 'domcontentloaded',
                timeout: 15000,
            });

            if (!response) {
                throw new Error('No response received');
            }

            const html = await page.content();
            const status = response.status();
            const finalUrl = page.url();

            await page.close();

            return { html, status, url: finalUrl };
        } catch (error) {
            if (page) await page.close();
            throw error;
        }
    }
}
