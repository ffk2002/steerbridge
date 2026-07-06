import { notFound } from "next/navigation";
import { StayDetailClient } from "@/components/stay-detail-client";
import { handleGetStayDetails } from "@/lib/managers/stay-manager";

/**
 * Stay Detail Page — ISR + CSR Hybrid
 *
 * The server component fetches the property shell (description, images, amenities,
 * host info) and renders it into the initial HTML.  The `revalidate` export enables
 * Incremental Static Regeneration so the shell is cached and re-generated at most
 * once per hour.
 *
 * Volatile data (reviews, booking availability) is strictly client-side via
 * TanStack Query inside `StayDetailClient`.
 */

export const revalidate = 3600; // ISR — revalidate every 1 hour

export default async function StayDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const stay = await handleGetStayDetails(id);

    if (!stay) {
        notFound();
    }

    return <StayDetailClient stay={stay} />;
}

