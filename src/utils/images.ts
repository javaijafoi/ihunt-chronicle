
/**
 * Processes an image URL to ensure it loads correctly in the browser.
 * Specifically handles Google Drive sharing links by converting them to direct preview links.
 */
export function getOptimizedImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;

    // Handle Google Drive links
    // Use the thumbnail endpoint as it's more reliable for embedding (handles CORS/Redirects better)
    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
    const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const fileMatch = url.match(driveFileRegex);

    if (fileMatch && fileMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w3840`;
    }

    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
    const openMatch = url.match(driveOpenRegex);

    if (openMatch && openMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w3840`;
    }

    return url;
}
