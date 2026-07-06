"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { Card, CardContent, IconButton, Typography, Box, Stack } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { styled } from "@mui/material/styles";

const StyledStayCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // More translucent than main theme
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    '&:hover .stay-image': { transform: 'scale(1.05)' }
}));

const ImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    paddingTop: '75%',
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
    marginBottom: theme.spacing(2),
    backgroundColor: 'rgba(0,0,0,0.05)'
}));

const CardImage = styled(Image, {
    shouldForwardProp: (prop) => prop !== 'imgLoaded'
})<{ imgLoaded?: boolean }>(({ imgLoaded }) => ({
    objectFit: 'cover',
    transition: 'transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease',
    opacity: imgLoaded ? 1 : 0,
    filter: imgLoaded ? 'blur(0px)' : 'blur(4px)',
}));

const CardTitleRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(0.5)
}));

const CardPricingRow = styled(Box)(({ theme }) => ({
    marginTop: 'auto',
    paddingTop: theme.spacing(1)
}));

const FavoriteButton = styled(IconButton)(() => ({
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    padding: '6px',
    '&:hover': { backgroundColor: 'white' },
    zIndex: 10,
}));

interface StayCardProps {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    avgRating: number;
    reviewCount: number;
}

export function StayCard({
    id,
    title,
    location,
    price,
    images,
    avgRating,
    reviewCount,
}: StayCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(id);
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <Link href={`/stays/${id}`} passHref style={{ textDecoration: 'none' }}>
            <StyledStayCard>
                {/* Image */}
                <ImageContainer>
                    <CardImage
                        src={images[0] || "/placeholder.jpg"}
                        alt={title}
                        fill
                        className="stay-image"
                        imgLoaded={imgLoaded}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onLoad={() => setImgLoaded(true)}
                    />
                    {/* Favorite Button */}
                    <FavoriteButton
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(id);
                        }}
                        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                    >
                        {favorited ? <FavoriteIcon color="primary" fontSize="small" /> : <FavoriteBorderIcon sx={{ color: 'text.primary' }} fontSize="small" />}
                    </FavoriteButton>
                </ImageContainer>

                {/* Content */}
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardTitleRow>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ pr: 1, color: 'text.primary', flexGrow: 1 }}>
                            {title}
                        </Typography>
                        {avgRating > 0 && (
                            <Stack direction="row" alignItems="center" gap={0.5} sx={{ shrink: 0 }}>
                                <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                <Typography variant="body2" fontWeight="medium" color="text.primary">
                                    {avgRating.toFixed(1)}
                                </Typography>
                            </Stack>
                        )}
                    </CardTitleRow>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                        {location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                    </Typography>
                    <CardPricingRow>
                        <Typography variant="body2" component="span" fontWeight="bold" color="text.primary">
                            ${price}
                        </Typography>
                        <Typography variant="body2" component="span" color="text.secondary">
                            {" / night"}
                        </Typography>
                    </CardPricingRow>
                </CardContent>
            </StyledStayCard>
        </Link>
    );
}
