import { StaysContent } from "@/components/stays-content";
import { handleSearchStays } from "@/lib/managers/stay-manager";

/**
 * Stays Discovery Page — SSR + CSR Hybrid
 *
 * The server component performs the initial database query so stays are present
 * in the first HTML response (SEO-friendly).  The client `StaysContent`
 * component hydrates with `initialData` and takes over for subsequent
 * interactions (filtering, map bounds, sorting) via TanStack Query.
 */

async function getInitialStays() {
    // Initial load: no filters, take 50, sort by created desc
    return handleSearchStays({});
}

export default async function StaysPage() {
    const initialStays = await getInitialStays();

    return <StaysContent initialStays={initialStays} />;
}

