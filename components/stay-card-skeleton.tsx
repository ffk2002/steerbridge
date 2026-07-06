import { Card, CardContent, Skeleton, Box } from "@mui/material";

export function StayCardSkeleton() {
    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
            <Skeleton variant="rectangular" width="100%" sx={{ height: 0, pt: '75%', borderRadius: 3, mb: 2 }} />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="text" width="75%" height={24} />
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="text" width="33%" height={20} />
                <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Skeleton variant="text" width="25%" height={24} />
                </Box>
            </CardContent>
        </Card>
    );
}

export function StayCardSkeletonGrid() {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <StayCardSkeleton key={i} />
            ))}
        </Box>
    );
}
