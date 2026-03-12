#!/bin/bash
mkdir -p app/core-seo app/advanced app/lighthouse app/technical app/speed app/diagnostics

mv app/schema-checker app/core-seo/
mv app/javascript-rendering-checker app/core-seo/
mv app/tools/meta-tags-analyzer app/core-seo/
mv app/tools/robots-txt-tester app/core-seo/
mv app/tools/sitemap-analyzer app/core-seo/
mv app/tools/redirect-checker app/core-seo/
mv app/tools/http-headers-checker app/core-seo/
mv app/tools/title-meta-length app/core-seo/
mv app/tools/heading-structure app/core-seo/
mv app/tools/broken-link-checker app/core-seo/
mv app/tools/serp-preview app/core-seo/

mv app/tools/internal-link-audit app/advanced/
mv app/tools/crawl-budget-simulator app/advanced/
mv app/tools/indexability-checker app/advanced/
mv app/tools/anchor-text-analyzer app/advanced/
mv app/tools/thin-content-detector app/advanced/
mv app/tools/keyword-cannibalization app/advanced/
mv app/tools/log-file-analyzer app/advanced/

mv app/tools/lighthouse-mobile app/lighthouse/mobile
mv app/tools/lighthouse-desktop app/lighthouse/desktop
mv app/tools/lighthouse-cwv app/lighthouse/core-web-vitals
mv app/tools/seo-audit app/lighthouse/seo-audit
mv app/tools/lighthouse-accessibility app/lighthouse/accessibility
mv app/tools/lighthouse-tracker app/lighthouse/tracker
mv app/tools/lighthouse-js-rendering app/lighthouse/js-rendering
# also there is lighthouse-seo
mv app/tools/lighthouse-seo app/lighthouse/seo

mv app/tools/js-seo-diff app/technical/
mv app/tools/canonical-conflicts app/technical/
mv app/tools/pagination-analyzer app/technical/
mv app/tools/duplicate-content app/technical/
mv app/tools/schema-coverage app/technical/

mv app/tools/js-bundle-analyzer app/speed/
mv app/tools/third-party-scripts app/speed/
mv app/tools/ttfb-checker app/speed/

mv app/tools/crawl-path app/diagnostics/
mv app/tools/serp-snippet app/diagnostics/
mv app/tools/orphan-pages app/diagnostics/
mv app/tools/index-history app/diagnostics/

# delete old Layout and Sidebar
rm app/tools/layout.tsx
rm components/Sidebar.tsx

echo "Done"
