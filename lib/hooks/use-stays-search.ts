import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { SelectChangeEvent } from '@mui/material/Select';
import { StayResponse } from "@/components/stays-content";
import { useMediaQuery, useTheme } from "@mui/material";
import { StaySearchQuerySchema } from "@/lib/schemas/stay";

export type DateErrors = { checkIn?: string; checkOut?: string };

// Thrown when the API rejects the search params, e.g. a hand-edited URL
class StaysValidationError extends Error {
    constructor(public fieldErrors: Record<string, string[] | undefined>) {
        super("Validation failed");
        this.name = "StaysValidationError";
    }
}

async function fetchStays(queryString: string): Promise<{ stays: StayResponse[] }> {
    const res = await fetch(`/api/stays?${queryString}`);
    if (res.status === 400) {
        const body = await res.json();
        throw new StaysValidationError(body.details?.fieldErrors ?? {});
    }
    if (!res.ok) throw new Error("Failed to fetch stays");
    return res.json();
}

// Same rules the API applies, so most mistakes are caught before the URL changes
function validateDates(checkIn: string, checkOut: string): DateErrors {
    const parsed = StaySearchQuerySchema.safeParse({
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
    });
    if (parsed.success) return {};
    const { fieldErrors } = parsed.error.flatten();
    return { checkIn: fieldErrors.checkIn?.[0], checkOut: fieldErrors.checkOut?.[0] };
}

export function useStaysSearch(initialStays: StayResponse[]) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const [guests, setGuests] = useState(searchParams.get("guests") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [dateErrors, setDateErrors] = useState<DateErrors>({});
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended");
    const [hoveredStayId, setHoveredStayId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");
    
    const [mapBounds, setMapBounds] = useState<{
        sw_lat: number;
        sw_lng: number;
        ne_lat: number;
        ne_lng: number;
    } | null>(null);

    // Re-sync inputs when the URL changes outside the form (back/forward navigation)
    const searchParamsString = searchParams.toString();
    const [syncedParams, setSyncedParams] = useState(searchParamsString);
    if (searchParamsString !== syncedParams) {
        setSyncedParams(searchParamsString);
        setSearchQuery(searchParams.get("query") || "");
        setGuests(searchParams.get("guests") || "");
        setCheckIn(searchParams.get("checkIn") || "");
        setCheckOut(searchParams.get("checkOut") || "");
        setSortBy(searchParams.get("sort") || "recommended");
        setDateErrors({});
    }

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

    const { data, error, isLoading, isError, isFetching, isPlaceholderData } = useQuery({
        queryKey: ["stays", currentQueryString],
        queryFn: () => fetchStays(currentQueryString),
        // Retrying a rejected search can't succeed
        retry: (failureCount, err) => !(err instanceof StaysValidationError) && failureCount < 3,
        placeholderData: keepPreviousData,
        // Only use SSR `initialData` if the query exactly matches what the server saw.
        initialData:
            currentQueryString === initialQueryStringRun && initialStays.length > 0
                ? { stays: initialStays }
                : undefined,
    });

    // First server-side validation message, if the API rejected the URL's params
    const validationMessage = error instanceof StaysValidationError
        ? Object.values(error.fieldErrors).flat().find(Boolean) ?? "Invalid search"
        : null;

    const handleCheckInChange = (val: string) => {
        setCheckIn(val);
        setDateErrors({});
    };

    const handleCheckOutChange = (val: string) => {
        setCheckOut(val);
        setDateErrors({});
    };

    const handleSearch = (e?: React.FormEvent, newSortBy?: string) => {
        if (e) e.preventDefault();

        const errors = validateDates(checkIn, checkOut);
        if (errors.checkIn || errors.checkOut) {
            setDateErrors(errors);
            return;
        }

        const params = new URLSearchParams();
        if (searchQuery) params.set("query", searchQuery);
        if (guests) params.set("guests", guests);
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);

        const activeSort = newSortBy !== undefined ? newSortBy : sortBy;
        if (activeSort !== "recommended") params.set("sort", activeSort);

        router.push(`/stays?${params.toString()}`);
    };

    // Applies to the submitted search only; unsubmitted text in the other inputs is left alone
    const clearDates = () => {
        setCheckIn("");
        setCheckOut("");
        setDateErrors({});
        const params = new URLSearchParams(searchParams.toString());
        params.delete("checkIn");
        params.delete("checkOut");
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
        checkIn, setCheckIn: handleCheckInChange,
        checkOut, setCheckOut: handleCheckOutChange,
        dateErrors, clearDates,
        sortBy, setSortBy,
        hoveredStayId, setHoveredStayId,
        viewMode, setViewMode,
        effectiveMode,
        showMap, showList,
        data, isLoading, isError, isFetching, isPlaceholderData, validationMessage,
        handleSearch, handleSortChange, handleBoundsChange,
        searchParamsQuery: searchParams.get("query"),
        activeCheckIn: searchParams.get("checkIn"),
        activeCheckOut: searchParams.get("checkOut"),
    };
}
