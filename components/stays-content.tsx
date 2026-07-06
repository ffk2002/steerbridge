"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { StayCard } from "@/components/stay-card";
import { StayCardSkeletonGrid } from "@/components/stay-card-skeleton";
import { Box, Button, Typography } from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';
import { FilterBar } from "@/components/filter-bar";
import { styled } from "@mui/material/styles";

const ResultsHeaderBox = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
    [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(3), paddingRight: theme.spacing(3) },
    [theme.breakpoints.up('lg')]: { paddingLeft: theme.spacing(4), paddingRight: theme.spacing(4) }
}));

const SplitPaneLayout = styled(Box)({
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
});

const ListPaneBox = styled(Box, { shouldForwardProp: (prop) => prop !== 'showMap' && prop !== 'isFetching' })<{ showMap: boolean; isFetching: boolean }>(({ theme, showMap, isFetching }) => ({
    overflowY: 'auto',
    padding: theme.spacing(2),
    width: '100%',
    transition: 'opacity 0.3s',
    opacity: isFetching ? 0.6 : 1,
    pointerEvents: isFetching ? 'none' : 'auto',
    [theme.breakpoints.up('sm')]: { padding: theme.spacing(3) },
    [theme.breakpoints.up('md')]: { width: showMap ? '50%' : '100%' },
    [theme.breakpoints.up('lg')]: { padding: theme.spacing(4) },
    [theme.breakpoints.up('xl')]: { width: showMap ? '60%' : '100%' }
}));

const EmptySearchBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
}));

const StaysGridBox = styled(Box, { shouldForwardProp: (prop) => prop !== 'showMap' })<{ showMap: boolean }>(({ theme, showMap }) => ({
    display: 'grid',
    gap: theme.spacing(4),
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('sm')]: { gridTemplateColumns: showMap ? '1fr' : '1fr 1fr' },
    [theme.breakpoints.up('lg')]: { gridTemplateColumns: showMap ? '1fr 1fr' : 'repeat(3, 1fr)' },
    [theme.breakpoints.up('xl')]: { gridTemplateColumns: showMap ? '1fr 1fr' : 'repeat(4, 1fr)' }
}));

const MapPaneBox = styled(Box, { shouldForwardProp: (prop) => prop !== 'showList' })<{ showList: boolean }>(({ theme, showList }) => ({
    position: 'sticky',
    top: 0,
    width: '100%',
    height: '100%',
    borderLeft: showList ? '1px solid' : 'none',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(12px)',
    [theme.breakpoints.up('md')]: { width: showList ? '50%' : '100%' },
    [theme.breakpoints.up('xl')]: { width: showList ? '40%' : '100%' }
}));

// Dynamic import with SSR disabled — Leaflet requires `window`
const StayMap = dynamic(
    () => import("@/components/stay-map").then((m) => m.StayMap),
    {
        ssr: false,
        loading: () => (
            <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Loading map…</Typography>
            </Box>
        ),
    }
);

export interface StayResponse {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    avgRating: number;
    reviewCount: number;
    latitude: number;
    longitude: number;
    guests: number;
}

import { useStaysSearch } from "@/lib/hooks/use-stays-search";

interface StaysContentProps {
    initialStays: StayResponse[];
}

function StaysContentInner({ initialStays }: StaysContentProps) {
    const staysSearch = useStaysSearch(initialStays);

    return <StaysView {...staysSearch} />;
}

interface StaysViewProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    guests: string;
    setGuests: (val: string) => void;
    sortBy: string;
    viewMode: "split" | "list" | "map";
    setViewMode: (mode: "split" | "list" | "map") => void;
    effectiveMode: "split" | "list" | "map";
    searchParamsQuery: string | null;
    hoveredStayId: string | null;
    setHoveredStayId: (id: string | null) => void;
    handleSearch: (e?: React.FormEvent, newSortBy?: string) => void;
    handleSortChange: (e: SelectChangeEvent<string>) => void;
    handleBoundsChange: (bounds: { sw_lat: number, sw_lng: number, ne_lat: number, ne_lng: number }) => void;
    data: { stays: StayResponse[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    showList: boolean;
    showMap: boolean;
}

function StaysView({
    searchQuery, setSearchQuery,
    guests, setGuests,
    sortBy,
    viewMode, setViewMode, effectiveMode,
    searchParamsQuery,
    hoveredStayId, setHoveredStayId,
    handleSearch, handleSortChange, handleBoundsChange,
    data, isLoading, isError, isFetching,
    showList, showMap
}: StaysViewProps) {

    const renderedStays = data?.stays.map((stay, index) => (
        <Box
            key={stay.id}
            onMouseEnter={() => setHoveredStayId(stay.id)}
            onMouseLeave={() => setHoveredStayId(null)}
            sx={{
                animation: 'fadeIn 0.5s ease-out both',
                animationDelay: `${index * 50}ms`,
                '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                }
            }}
        >
            <StayCard
                id={stay.id}
                title={stay.title}
                location={stay.location}
                price={stay.price}
                images={stay.images}
                avgRating={stay.avgRating}
                reviewCount={stay.reviewCount}
            />
        </Box>
    ));

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {/* Search Bar */}
            <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                guests={guests}
                setGuests={setGuests}
                handleSearch={handleSearch}
                sortBy={sortBy}
                handleSortChange={handleSortChange}
                viewMode={viewMode}
                setViewMode={setViewMode}
                effectiveMode={effectiveMode}
            />

            {/* Results Header */}
            <ResultsHeaderBox>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {searchParamsQuery
                        ? `Stays in "${searchParamsQuery}"`
                        : "Explore All Stays"}
                </Typography>
                {data && (
                    <Typography variant="body2" color="text.secondary">
                        {data.stays.length} result{data.stays.length !== 1 ? "s" : ""}
                    </Typography>
                )}
            </ResultsHeaderBox>

            {/* Split Pane: List + Map */}
            <SplitPaneLayout>
                {/* Left: Card List */}
                {showList && (
                    <ListPaneBox showMap={showMap} isFetching={isFetching}>
                        {/* Loading */}
                        {isLoading && <StayCardSkeletonGrid />}

                        {/* Error */}
                        {isError && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary" mb={2}>
                                    Something went wrong while fetching stays.
                                </Typography>
                                <Button variant="contained" onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </Box>
                        )}

                        {/* Empty */}
                        {!isLoading && data && data.stays.length === 0 && (
                            <EmptySearchBox>
                                <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold" color="text.primary" mb={1}>
                                    No stays found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try broadening your filters, zooming out on the map, or clearing your search.
                                </Typography>
                            </EmptySearchBox>
                        )}

                        {/* Results */}
                        {data && data.stays.length > 0 && (
                            <StaysGridBox showMap={showMap}>
                                {renderedStays}
                            </StaysGridBox>
                        )}
                    </ListPaneBox>
                )}

                {/* Right: Map */}
                {showMap && (
                    <MapPaneBox showList={showList}>
                        <StayMap
                            stays={data?.stays || []}
                            onBoundsChange={handleBoundsChange}
                            hoveredStayId={hoveredStayId}
                        />
                    </MapPaneBox>
                )}
            </SplitPaneLayout>
        </Box>
    );
}

export function StaysContent({ initialStays }: StaysContentProps) {
    return (
        <Suspense
            fallback={
                <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, lg: 4 } }}>
                    <StayCardSkeletonGrid />
                </Box>
            }
        >
            <StaysContentInner initialStays={initialStays} />
        </Suspense>
    );
}
