import { NextResponse } from "next/server";
import { withAction } from "@/lib/api-utils";
import { handleGetStayReviews, handleCreateReview, ReviewCreationError } from "@/lib/managers/review-manager";
import { CreateReviewRequestSchema } from "@/lib/schemas/review";

export const GET = withAction<{ id: string }>(async (request, { params, logger: actionLogger }) => {
    const { id: stayId } = await params;
    
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = 10;

        // Delegate to Manager
        const reviewData = await handleGetStayReviews(stayId, page, pageSize, actionLogger);

        return NextResponse.json(reviewData);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Stay not found") {
            actionLogger.warn({ stay_id: stayId }, "Stay not found");
            return NextResponse.json({ error: "Stay not found" }, { status: 404 });
        }
        
        throw error; // Bubbles up to withAction for 500
    }
}, { requireCsrf: false });


export const POST = withAction<{ id: string }>(async (request, { params, logger: actionLogger }) => {
    const { id: stayId } = await params;
    const body = await request.json();

    // 1. Validate Input (API Boundary Contract)
    const parsed = CreateReviewRequestSchema.safeParse(body);
    if (!parsed.success) {
        actionLogger.warn({ details: parsed.error.flatten(), stay_id: stayId }, "Validation failed at API Boundary");
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        // 2. Delegate to Manager
        const review = await handleCreateReview(stayId, parsed.data, actionLogger);

        actionLogger.info({ reviewId: review.id, stay_id: stayId }, "Review created successfully");
        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        if (error instanceof ReviewCreationError) {
            if (error.statusCode === 404) {
                actionLogger.warn({ stay_id: stayId }, "Stay not found");
            } else {
                 actionLogger.warn({ message: error.message, stay_id: stayId }, "Review domain conflict");
            }
            return NextResponse.json(
                { error: error.message, details: error.details },
                { status: error.statusCode }
            );
        }
        
        throw error; // Bubbles up to withAction
    }
});
