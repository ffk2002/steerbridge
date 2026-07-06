export function sanitizeReviewContent(content: string): string {
    // Basic XSS sanitization (strips HTML tags)
    return content.replace(/<[^>]*>/g, "");
}
