"use client";

import { useFavorites } from "@/lib/hooks/use-favorites";
import { Box, Container, Typography, IconButton, Grid, Stack, Avatar } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ImageGallery } from "@/components/image-gallery";
import { BookingWidget } from "@/components/booking-widget";
import { ReviewSection } from "@/components/review-section";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
    }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3)
}));

const QuickStatsStack = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    flexWrap: 'wrap'
}));

const HostBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(4),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider
}));

const SectionBox = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider
}));



/** The static "shell" data that the server component pre-fetches and passes in. */
export interface StayShell {
    id: string;
    title: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    price: number;
    guests: number;
    bedrooms: number;
    beds: number;
    baths: number;
    amenities: string[];
    images: string[];
    hostName: string;
    avgRating: number;
    reviewCount: number;
}

interface StayDetailClientProps {
    stay: StayShell;
}

export function StayDetailClient({ stay }: StayDetailClientProps) {
    const { isFavorite, toggleFavorite } = useFavorites();

    const favorited = isFavorite(stay.id);

    return (
        <PageContainer maxWidth="lg">
            {/* Header */}
            <HeaderBox>
                <Box>
                    <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary">
                        {stay.title}
                    </Typography>
                    <QuickStatsStack>
                        {stay.avgRating > 0 && (
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <StarIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                                <Typography fontWeight="medium" color="text.primary">{stay.avgRating.toFixed(1)}</Typography>
                            </Stack>
                        )}
                        <Typography>·</Typography>
                        <Typography>{stay.reviewCount} reviews</Typography>
                        <Typography>·</Typography>
                        <Typography>{stay.location}</Typography>
                    </QuickStatsStack>
                </Box>
                <IconButton
                    onClick={() => toggleFavorite(stay.id)}
                    sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                    aria-label={favorited ? "Unsave" : "Save"}
                >
                    {favorited ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
                </IconButton>
            </HeaderBox>

            {/* Images */}
            <ImageGallery
                title={stay.title}
                images={stay.images}
            />

            {/* Content Grid */}
            <Grid container spacing={6}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Host */}
                    <HostBox>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" mb={0.5}>Hosted by {stay.hostName}</Typography>
                            <Typography variant="body1" color="text.secondary">
                                {stay.guests} guests · {stay.bedrooms} bedrooms · {stay.beds} beds · {stay.baths} baths
                            </Typography>
                        </Box>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem' }}>
                            {stay.hostName.charAt(0)}
                        </Avatar>
                    </HostBox>

                    {/* Description */}
                    <SectionBox>
                        <Typography variant="h5" fontWeight="bold" mb={2}>About this place</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {stay.description}
                        </Typography>
                    </SectionBox>

                    {/* Amenities */}
                    <SectionBox>
                        <Typography variant="h5" fontWeight="bold" mb={3}>What this place offers</Typography>
                        <Grid container spacing={2}>
                            {stay.amenities.map(amenity => (
                                <Grid size={{ xs: 12, sm: 6 }} key={amenity}>
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <CheckCircleOutlineIcon color="action" />
                                        <Typography color="text.primary">{amenity}</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </SectionBox>

                    {/* Reviews */}
                    <ReviewSection
                        stayId={stay.id}
                        stayReviewCount={stay.reviewCount}
                    />
                </Grid>

                {/* Right: Booking Form */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <BookingWidget
                        stayId={stay.id}
                        stayPrice={stay.price}
                        maxGuests={stay.guests}
                    />
                </Grid>
            </Grid>
        </PageContainer>
    );
}
