import chromium from "@sparticuz/chromium";
import { Browser } from "puppeteer-core";
import fs from "fs";

export const getExecutablePath = async () => {
    // If we're in production (Vercel), use sparticuz chromium
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        return await chromium.executablePath();
    }
    
    // Local development: Try to find local Chrome/Chromium
    // Common Mac paths
    const macPaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome'
    ];

    for (const path of macPaths) {
        if (fs.existsSync(path)) return path;
    }

    // Fallback to let sparticuz try
    return await chromium.executablePath();
};

export const getLaunchOptions = async () => {
    const executablePath = await getExecutablePath();
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.AWS_EXECUTION_ENV;
    
    if (isProd) {
        // Required for some serverless environments to prevent crashes
        chromium.setGraphicsMode = false;
    }

    return {
        args: isProd ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 },
        executablePath: executablePath,
        headless: isProd ? true : "shell",
    } as any;
};
