import { NextResponse } from "next/server";
import { withAction } from "@/lib/api-utils";
import { handleSearchStays } from "@/lib/managers/stay-manager";

export const GET = withAction(async (request, { logger: actionLogger }) => {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const queryParams = Object.fromEntries(searchParams.entries());

    try {
        // Delegate to Manager
        const stays = await handleSearchStays(queryParams, actionLogger);

        return NextResponse.json({ stays });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Validation failed") {
            actionLogger.warn({ params: queryParams }, "Validation failed for search params");
            return NextResponse.json(
                { error: "Validation failed" },
                { status: 400 }
            );
        }

        // Let the unhandled boundary catch the 500
        throw error;
    }
}, { requireCsrf: false });
