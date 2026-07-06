import Image from "next/image";
import { Box, Stack } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";

const ThumbnailButton = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected: boolean }>(({ theme, selected }) => ({
    position: 'relative',
    width: 96,
    height: 64,
    [theme.breakpoints.up('sm')]: {
        width: 120,
        height: 80,
    },
    borderRadius: 16,
    overflow: 'hidden',
    flexShrink: 0,
    cursor: 'pointer',
    border: '2px solid',
    borderColor: selected ? theme.palette.primary.main : 'transparent',
    opacity: selected ? 1 : 0.6,
    transition: 'all 0.2s',
    '&:hover': { opacity: 1 },
}));

interface ImageGalleryProps {
    title: string;
    images: string[];
}

export function ImageGallery({ title, images }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    const thumbnailList = images.map((img, i) => (
        <ThumbnailButton
            key={i}
            selected={selectedImage === i}
            onClick={() => setSelectedImage(i)}
        >
            <Image src={img} alt="" fill sizes="120px" className="object-cover" />
        </ThumbnailButton>
    ));

    return (
        <Box className="animated-bg" sx={{ mb: 6, p: { xs: 2, md: 4 }, borderRadius: { xs: 0, md: 6 }, mx: { xs: -2, md: 0 } }}>
            <Box sx={{ position: 'relative', pt: '50%', bgcolor: 'background.default', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <Image
                    src={images[selectedImage] || "/placeholder.jpg"}
                    alt={`${title} - Photo ${selectedImage + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                    className="object-cover"
                    priority
                />
            </Box>
            {images.length > 1 && (
                <Stack direction="row" gap={2} sx={{ mt: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    {thumbnailList}
                </Stack>
            )}
        </Box>
    );
}
