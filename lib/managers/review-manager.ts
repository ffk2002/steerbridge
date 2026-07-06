import { CreateReviewRequestSchema } from "@/lib/schemas/review";
import * as ReviewRepository from "@/lib/data/reviews";
import * as StayRepository from "@/lib/data/stays";
import * as ReviewEngine from "@/lib/engines/reviews";
import { z } from "zod";
import { logger as globalLogger } from "@/lib/logger";

type Logger = typeof globalLogger;

export class ReviewCreationError extends Error {
    constructor(public message: string, public statusCode: number = 400, public details?: unknown) {
        super(message);
        this.name = "ReviewCreationError";
    }
}

export async function handleGetStayReviews(stayId: string, page: number = 1, pageSize: number = 10, logger: Logger = globalLogger) {
    const stay = await StayRepository.getStayById(stayId);
    if (!stay) {
        throw new Error("Stay not found");
    }

    const [reviews, totalCount] = await Promise.all([
        ReviewRepository.getReviewsByStay(stayId, page, pageSize),
        ReviewRepository.getReviewCount(stayId),
    ]);

    logger.info({ stayId, reviewCount: reviews.length, totalCount, page }, "Successfully fetched reviews");
    return {
        reviews,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        },
    };
}

export type CreateReviewInput = z.infer<typeof CreateReviewRequestSchema>;

export async function handleCreateReview(stayId: string, parsedData: CreateReviewInput, logger: Logger = globalLogger) {
    logger.debug({ stayId, rating: parsedData.rating }, "Starting review creation");
    const stay = await StayRepository.getStayById(stayId);
    if (!stay) {
        throw new ReviewCreationError("Stay not found", 404);
    }

    // Sanitize content via pure Engine function
    const sanitizedContent = ReviewEngine.sanitizeReviewContent(parsedData.content);

    // Create via Data Layer
    const review = await ReviewRepository.createReview({
        stayId,
        rating: parsedData.rating,
        content: sanitizedContent,
        authorId: "anonymous", // Local app uses anonymous identity.
        authorName: parsedData.authorName,
    });

    logger.info({ reviewId: review.id, stayId, rating: review.rating }, "Successfully created new review");
    return review;
}
