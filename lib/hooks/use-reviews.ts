import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Review {
    id: string;
    rating: number;
    content: string;
    authorName: string;
    createdAt: string;
}

async function fetchStayReviews(id: string): Promise<{
    reviews: Review[];
    pagination: { totalCount: number; totalPages: number };
}> {
    const res = await fetch(`/api/stays/${id}/reviews`);
    if (!res.ok) throw new Error("Failed");
    return res.json();
}

async function submitReview(data: { rating: number; content: string; authorName: string; stayId: string }) {
    const res = await fetch(`/api/stays/${data.stayId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            rating: data.rating,
            content: data.content,
            authorName: data.authorName
        }),
    });
    if (!res.ok) throw new Error("Failed to submit review");
    return res.json();
}

export function useReviews(stayId: string) {
    const queryClient = useQueryClient();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewAuthor, setReviewAuthor] = useState("");

    const { data: reviewsData } = useQuery({
        queryKey: ["reviews", stayId],
        queryFn: () => fetchStayReviews(stayId),
    });

    const createReview = useMutation({
        mutationFn: (data: { rating: number; content: string; authorName: string }) =>
            submitReview({ ...data, stayId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews", stayId] });
            queryClient.invalidateQueries({ queryKey: ["stay", stayId] });
            setShowReviewForm(false);
            setReviewContent("");
            setReviewRating(5);
            setReviewAuthor("");
        },
    });

    return {
        showReviewForm,
        setShowReviewForm,
        reviewRating,
        setReviewRating,
        reviewContent,
        setReviewContent,
        reviewAuthor,
        setReviewAuthor,
        reviewsData,
        createReview,
    };
}
