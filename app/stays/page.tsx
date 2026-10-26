import { StaysContent } from "@/components/stays-content";
import { handleSearchStays, StaySearchValidationError } from "@/lib/managers/stay-manager";

/**
 * Stays Discovery Page — SSR + CSR Hybrid
 *
 * The server component performs the initial database query so stays are present
 * in the first HTML response (SEO-friendly).  The client `StaysContent`
 * component hydrates with `initialData` and takes over for subsequent
 * interactions (filtering, map bounds, sorting) via TanStack Query.
 */

// Must match the URL params `useStaysSearch` sends on first render, since the client
// only reuses these results when its query string matches. Map bounds are client-only.
const URL_SEARCH_KEYS = ["query", "guests", "checkIn", "checkOut", "sort"] as const;

type SearchParams = Record<string, string | string[] | undefined>;

async function getInitialStays(searchParams: SearchParams) {
    const queryParams: Record<string, string> = {};
    for (const key of URL_SEARCH_KEYS) {
        const value = searchParams[key];
        // Repeated params use the last value, as the API route does
        const last = Array.isArray(value) ? value.at(-1) : value;
        if (last) queryParams[key] = last;
    }

    try {
        return await handleSearchStays(queryParams);
    } catch (error) {
        // Render without results; the client fetch gets the 400 and shows why
        if (error instanceof StaySearchValidationError) return [];
        throw error;
    }
}

export default async function StaysPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const initialStays = await getInitialStays(await searchParams);

    return <StaysContent initialStays={initialStays} />;
}
