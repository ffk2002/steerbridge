import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { verifyCsrfOrigin } from "@/lib/csrf";

export type ActionHandler<TParams = unknown> = (
    req: NextRequest,
    context: {
        params: Promise<TParams>;
        logger: typeof logger;
        correlationId: string;
    }
) => Promise<NextResponse>;

/**
 * A higher-order function to encapsulate common API Route Handler concerns:
 * - Correlation ID generation
 * - Child logger binding
 * - Centralized origin-based CSRF protection for mutations
 * - Unhandled error boundary
 */
export function withAction<TParams = unknown>(
    handler: ActionHandler<TParams>,
    options: { requireCsrf?: boolean } = { requireCsrf: true }
) {
    return async (
        request: NextRequest,
        { params }: { params: Promise<TParams> }
    ): Promise<NextResponse> => {
        const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();
        const actionLogger = logger.child({
            correlation_id: correlationId,
            path: request.nextUrl.pathname,
            method: request.method
        });

        // 1. CSRF Protection for mutations
        if (options.requireCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
            if (!verifyCsrfOrigin(request)) {
                actionLogger.warn("CSRF origin check failed");
                return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
            }
        }

        try {
            // 2. Execute the handler
            return await handler(request, { params, logger: actionLogger, correlationId });
        } catch (error) {
            // 3. Centralized Fallback Error Boundary
            actionLogger.error(error, "Unhandled API Action Error");
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    };
}
