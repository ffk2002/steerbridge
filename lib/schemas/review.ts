import { z } from "zod";

export const ReviewSchema = z.object({
    id: z.string().uuid(),
    stayId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    content: z.string().max(1000),
    authorId: z.string(),
    authorName: z.string(),
    createdAt: z.coerce.date(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewRequestSchema = z.object({
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10, "Review must be at least 10 characters long").max(1000),
    authorName: z.string().min(2, "Name is required"),
});
