import { chromium, Browser, Page } from 'playwright';

interface FetchResult {
    html: string;
    status: number;
    url: string; // The final URL after redirects
}

export class Crawler {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'], // Safer for containerized envs
            });
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

        const context = await this.browser!.newContext({
            javaScriptEnabled: jsEnabled,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        const page = await context.newPage();

        // Block heavy resources
        await page.route('**/*', (route) => {
            const request = route.request();
            if (['image', 'media', 'font', 'stylesheet'].includes(request.resourceType())) {
                return route.abort();
            }
            return route.continue();
        });

        try {
            const response = await page.goto(url, {
                waitUntil: jsEnabled ? 'networkidle' : 'domcontentloaded',
                timeout: 15000, // 15s timeout
            });

            if (!response) {
                throw new Error('No response received');
            }

            const html = await page.content();
            const status = response.status();
            const finalUrl = page.url();

            await context.close();

            return { html, status, url: finalUrl };
        } catch (error) {
            await context.close();
            throw error;
        }
    }
}
