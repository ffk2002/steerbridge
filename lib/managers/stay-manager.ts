import { Prisma } from "@prisma/client";
import * as StayRepository from "@/lib/data/stays";
import * as ReviewRepository from "@/lib/data/reviews";
import * as BookingRepository from "@/lib/data/bookings";
import { StaySearchQuerySchema } from "@/lib/schemas/stay";
import { logger as globalLogger } from "@/lib/logger";

type Logger = typeof globalLogger;

export class StaySearchValidationError extends Error {
    constructor(public message: string, public details?: unknown) {
        super(message);
        this.name = "StaySearchValidationError";
    }
}

export async function handleSearchStays(queryParams: unknown, logger: Logger = globalLogger) {
    const parsed = StaySearchQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
        throw new StaySearchValidationError("Validation failed", parsed.error.flatten());
    }

    const {
        query,
        guests,
        checkIn,
        checkOut,
        sw_lat,
        sw_lng,
        ne_lat,
        ne_lng,
    } = parsed.data;

    // Build the where clause dynamically
    const where: Record<string, unknown> = {};

    if (query) {
        where.OR = [
            { title: { contains: query } },
            { location: { contains: query } },
            { description: { contains: query } },
        ];
    }
    if (guests && guests > 0) {
        where.guests = { gte: guests };
    }
    if (sw_lat !== undefined && sw_lng !== undefined && ne_lat !== undefined && ne_lng !== undefined) {
        where.latitude = { gte: sw_lat, lte: ne_lat };
        where.longitude = { gte: sw_lng, lte: ne_lng };
    }

    // Availability filtering: only stays with no overlapping confirmed booking, in the same query
    if (checkIn && checkOut) {
        where.bookings = { none: BookingRepository.overlappingBookingsWhere(new Date(checkIn), new Date(checkOut)) };
    }

    // Since we don't have sort in schema right now we type cast for now
    const params = queryParams as { sort?: string };
    const sort = params.sort;

    let orderBy: Prisma.StayOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const stays = await StayRepository.getStays(where as Prisma.StayWhereInput, orderBy);

    // Enrich with ratings and return clean DTOs
    const staysWithRating = await Promise.all(
        stays.map(async (stay) => {
            const avgRating = await ReviewRepository.getAverageRating(stay.id);
            return {
                id: stay.id,
                title: stay.title,
                location: stay.location,
                price: stay.price,
                images: JSON.parse(stay.images),
                amenities: JSON.parse(stay.amenities),
                avgRating,
                reviewCount: stay._count.reviews,
                latitude: stay.latitude,
                longitude: stay.longitude,
                guests: stay.guests,
            };
        })
    );

    if (sort === "rating_desc") {
        staysWithRating.sort((a, b) => b.avgRating - a.avgRating);
    }

    logger.info({ resultCount: staysWithRating.length, params: queryParams }, "Successfully fetched properties");
    return staysWithRating;
}

export async function handleGetStayDetails(id: string, logger: Logger = globalLogger) {
    logger.debug({ stayId: id }, "Fetching stay details");
    const stay = await StayRepository.getStayById(id);
    if (!stay) {
        logger.warn({ stayId: id }, "Stay details not found in database");
        return null;
    }

    const avgRating = await ReviewRepository.getAverageRating(id);
    const bookings = await StayRepository.getStayBookings(id);

    // Return a clean, serializable DTO
    const dto = {
        id: stay.id,
        title: stay.title,
        description: stay.description,
        location: stay.location,
        latitude: stay.latitude,
        longitude: stay.longitude,
        price: stay.price,
        guests: stay.guests,
        bedrooms: stay.bedrooms,
        beds: stay.beds,
        baths: stay.baths,
        amenities: JSON.parse(stay.amenities),
        images: JSON.parse(stay.images),
        hostName: stay.hostName,
        avgRating,
        reviewCount: stay._count.reviews,
        bookedDates: bookings.map((b) => ({
            checkIn: b.checkIn.toISOString(),
            checkOut: b.checkOut.toISOString(),
        })),
    };

    logger.info({ stayId: id, hasBookings: bookings.length > 0 }, "Successfully assembled stay details");
    return dto;
}

