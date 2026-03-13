const fs = require('fs');

const files = [
    "app/advanced/anchor-text-analyzer/client.tsx",
    "app/advanced/log-file-analyzer/client.tsx",
    "app/advanced/thin-content-detector/client.tsx",
    "app/advanced/crawl-budget-simulator/client.tsx",
    "app/advanced/core-web-vitals/client.tsx",
    "app/advanced/indexability-checker/client.tsx",
    "app/advanced/keyword-cannibalization/client.tsx",
    "app/advanced/internal-link-audit/client.tsx",
    "app/speed/third-party-scripts/client.tsx",
    "app/speed/js-bundle-analyzer/client.tsx",
    "app/speed/ttfb-checker/client.tsx",
    "app/core-seo/meta-tags-analyzer/client.tsx",
    "app/core-seo/serp-preview/client.tsx",
    "app/core-seo/redirect-checker/client.tsx",
    "app/core-seo/heading-structure/client.tsx",
    "app/core-seo/title-meta-length/client.tsx",
    "app/core-seo/broken-link-checker/client.tsx",
    "app/core-seo/sitemap-analyzer/client.tsx",
    "app/core-seo/robots-txt-tester/client.tsx",
    "app/core-seo/http-headers-checker/client.tsx",
    "app/diagnostics/crawl-path/client.tsx",
    "app/diagnostics/serp-snippet/client.tsx",
    "app/diagnostics/index-history/client.tsx",
    "app/diagnostics/orphan-pages/client.tsx",
    "app/lighthouse/seo-audit/client.tsx",
    "app/technical/canonical-conflicts/client.tsx",
    "app/technical/duplicate-content/client.tsx",
    "app/technical/schema-coverage/client.tsx",
    "app/technical/js-seo-diff/client.tsx",
    "app/technical/pagination-analyzer/client.tsx",
    // Adding the two missing page.tsx ones that were found earlier but had different handlers maybe? No they didn't show up in the grep for onSubmit.
    "app/core-seo/javascript-rendering-checker/page.tsx",
    "app/core-seo/schema-checker/page.tsx",
    "app/core-seo/javascript-rendering-checker/client.tsx",
    "app/core-seo/schema-checker/client.tsx"
];

let updatedCount = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('let targetUrl = url;')) return; // Already updated

    // Remove existing `if (!url) return;` to avoid duplicates
    content = content.replace(/\n\s*if \(!url\) return;/g, '');

    const replacementBlock = `e.preventDefault();
        if (!url) return;
        let targetUrl = url;
        if (!/^https?:\\/\\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);`;

    content = content.replace(/e\.preventDefault\(\);/, replacementBlock);
    
    content = content.replace(/JSON\.stringify\(\{ url \}\)/g, 'JSON.stringify({ url: targetUrl })');
    content = content.replace(/JSON\.stringify\(\{\s*url\s*,/g, 'JSON.stringify({ url: targetUrl,');
    content = content.replace(/,\s*url\s*\}\)/g, ', url: targetUrl })');
    content = content.replace(/url=\\$\\{encodeURIComponent\\(url\\)\\}/g, 'url=${encodeURIComponent(targetUrl)}');

    fs.writeFileSync(file, content);
    console.log('Updated:', file);
    updatedCount++;
});

console.log('Total updated:', updatedCount);
