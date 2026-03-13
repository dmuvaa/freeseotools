/**
 * Centralized configuration utility for environment variables.
 */

export const config = {
    // The base URL of the application (e.g., https://yourdomain.com)
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};

/**
 * Returns an absolute URL based on the APP_URL if the provided path is relative.
 */
export function getAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const baseUrl = config.appUrl.replace(/\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
