import { NextRequest } from "next/server";
import { logger } from "./logger";

/**
 * Validates the Origin header of a request against the Host header (or NEXT_PUBLIC_SITE_URL).
 * This provides basic CSRF protection for mutations in Route Handlers.
 */
export function verifyCsrfOrigin(request: NextRequest): boolean {
    // Skip CSRF check in non-production environments if explicitly bypassed,
    // or just rely on the strict check below. Playwright tests might need headers set properly.
    if (process.env.NODE_ENV === "test") return true;

    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (!origin) {
        // Same-origin browser requests might omit Origin, but we can check Referer
        const referer = request.headers.get("referer");
        if (referer && host && new URL(referer).host === host) {
            return true;
        }
        logger.warn("[CSRF] Missing origin and valid referer");
        return false;
    }

    try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
            logger.warn({ origin, host }, "[CSRF] Mismatched origin");
            return false;
        }
        return true;
    } catch (e) {
        logger.error(e, "[CSRF] Invalid origin format");
        return false;
    }
}
