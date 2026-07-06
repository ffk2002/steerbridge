import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { SelectChangeEvent } from '@mui/material/Select';
import { StayResponse } from "@/components/stays-content";
import { useMediaQuery, useTheme } from "@mui/material";

async function fetchStays(queryString: string): Promise<{ stays: StayResponse[] }> {
    const res = await fetch(`/api/stays?${queryString}`);
    if (!res.ok) throw new Error("Failed to fetch stays");
    return res.json();
}

export function useStaysSearch(initialStays: StayResponse[]) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const [guests, setGuests] = useState(searchParams.get("guests") || "");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended");
    const [hoveredStayId, setHoveredStayId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
    
    const [mapBounds, setMapBounds] = useState<{
        sw_lat: number;
        sw_lng: number;
        ne_lat: number;
        ne_lng: number;
    } | null>(null);

    const buildQueryString = useCallback(() => {
        const qs = new URLSearchParams();
        if (searchParams.get("query")) qs.set("query", searchParams.get("query")!);
        if (searchParams.get("guests")) qs.set("guests", searchParams.get("guests")!);
        if (searchParams.get("checkIn")) qs.set("checkIn", searchParams.get("checkIn")!);
        if (searchParams.get("checkOut")) qs.set("checkOut", searchParams.get("checkOut")!);
        if (mapBounds) {
            qs.set("sw_lat", mapBounds.sw_lat.toString());
            qs.set("sw_lng", mapBounds.sw_lng.toString());
            qs.set("ne_lat", mapBounds.ne_lat.toString());
            qs.set("ne_lng", mapBounds.ne_lng.toString());
        }
        if (sortBy !== "recommended") qs.set("sort", sortBy);
        return qs.toString();
    }, [searchParams, mapBounds, sortBy]);

    // Track the query string from the initial render (SSR)
    const [initialQueryStringRun] = useState(buildQueryString());
    const currentQueryString = buildQueryString();

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["stays", currentQueryString],
        queryFn: () => fetchStays(currentQueryString),
        placeholderData: keepPreviousData,
        // Only use SSR `initialData` if the query exactly matches what the server saw.
        initialData:
            currentQueryString === initialQueryStringRun && initialStays.length > 0
                ? { stays: initialStays }
                : undefined,
    });

    const handleSearch = (e?: React.FormEvent, newSortBy?: string) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set("query", searchQuery);
        if (guests) params.set("guests", guests);

        const activeSort = newSortBy !== undefined ? newSortBy : sortBy;
        if (activeSort !== "recommended") params.set("sort", activeSort);

        router.push(`/stays?${params.toString()}`);
    };

    const handleSortChange = (e: SelectChangeEvent<string>) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        handleSearch(undefined, newSort);
    };

    const handleBoundsChange = useCallback(
        (bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }) => {
            setMapBounds(bounds);
        },
        []
    );

    // On mobile, "split" behaves as "list" since map can't show alongside list
    const effectiveMode = isMobile && viewMode === "split" ? "list" : viewMode;
    const showMap = effectiveMode === "split" || effectiveMode === "map";
    const showList = effectiveMode === "split" || effectiveMode === "list";

    // Clear map bounds when switching away from map view
    const mapBoundsRef = useRef(mapBounds);
    useEffect(() => {
        mapBoundsRef.current = mapBounds;
    }, [mapBounds]);

    useEffect(() => {
        if (!showMap && mapBoundsRef.current !== null) {
            const timer = setTimeout(() => {
                setMapBounds(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showMap]);

    return {
        searchQuery, setSearchQuery,
        guests, setGuests,
        sortBy, setSortBy,
        hoveredStayId, setHoveredStayId,
        viewMode, setViewMode,
        effectiveMode,
        showMap, showList,
        data, isLoading, isError, isFetching,
        handleSearch, handleSortChange, handleBoundsChange,
        searchParamsQuery: searchParams.get("query")
    };
}
