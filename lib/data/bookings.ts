import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getBookingByIdempotencyKey(idempotencyKey: string) {
    return prisma.booking.findUnique({
        where: { idempotencyKey },
    });
}

// Confirmed bookings that overlap the requested range. Shared by the booking check and stay search
export function overlappingBookingsWhere(checkInDate: Date, checkOutDate: Date): Prisma.BookingWhereInput {
    return {
        status: "CONFIRMED",
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
    };
}

export async function getOverlappingBookings(stayId: string, checkInDate: Date, checkOutDate: Date) {
    return prisma.booking.findFirst({
        where: {
            stayId,
            ...overlappingBookingsWhere(checkInDate, checkOutDate),
        },
    });
}

export async function createBooking(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.booking.create({
        data,
    });
}
