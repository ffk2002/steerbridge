import { Box, Typography, Button, Card, Rating, TextField, Stack, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useReviews } from "@/lib/hooks/use-reviews";

const ReviewItemContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(3)
}));

const ReviewAuthorGroup = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.5)
}));

const ReviewAuthorAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
    width: 40,
    height: 40,
    fontWeight: 'bold'
}));

const ReviewsHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4)
}));

const ReviewFormCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(3)
}));



interface ReviewSectionProps {
    stayId: string;
    stayReviewCount: number;
}

export function ReviewSection({
    stayId,
    stayReviewCount
}: ReviewSectionProps) {
    const {
        showReviewForm,
        setShowReviewForm,
        reviewRating,
        setReviewRating,
        reviewContent,
        setReviewContent,
        reviewAuthor,
        setReviewAuthor,
        reviewsData,
        createReview
    } = useReviews(stayId);
    const reviewList = reviewsData?.reviews.map(review => (
        <ReviewItemContainer key={review.id}>
            <ReviewAuthorGroup>
                <ReviewAuthorAvatar>
                    {review.authorName.charAt(0)}
                </ReviewAuthorAvatar>
                <Box>
                    <Typography fontWeight="bold" fontSize="0.95rem">{review.authorName}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                </Box>
            </ReviewAuthorGroup>
            <Typography color="text.secondary" variant="body2">{review.content}</Typography>
        </ReviewItemContainer>
    ));

    return (
        <Box sx={{ py: 4 }}>
            <ReviewsHeaderBox>
                <Typography variant="h5" fontWeight="bold">
                    Reviews ({reviewsData?.pagination.totalCount || stayReviewCount})
                </Typography>
                <Button variant="text" color="primary" onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write a Review
                </Button>
            </ReviewsHeaderBox>

            {/* Review Form */}
            {showReviewForm && (
                <ReviewFormCard variant="outlined">
                    <Rating
                        value={reviewRating}
                        onChange={(_, v) => setReviewRating(v || 5)}
                        size="large"
                        sx={{ mb: 2 }}
                    />
                    <TextField fullWidth placeholder="Your Name" value={reviewAuthor} onChange={e => setReviewAuthor(e.target.value)} sx={{ mb: 2 }} />
                    <TextField fullWidth multiline rows={3} placeholder="Share your experience..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} sx={{ mb: 3 }} />
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => createReview.mutate({ rating: reviewRating, content: reviewContent, authorName: reviewAuthor })}
                        disabled={createReview.isPending || reviewContent.length < 10 || reviewAuthor.length < 2}
                    >
                        {createReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                </ReviewFormCard>
            )}

            {/* Review List */}
            <Stack spacing={3}>
                {reviewList}
            </Stack>
        </Box>
    );
}
