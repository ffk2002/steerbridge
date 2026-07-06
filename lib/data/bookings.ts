import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getBookingByIdempotencyKey(idempotencyKey: string) {
    return prisma.booking.findUnique({
        where: { idempotencyKey },
    });
}

export async function getOverlappingBookings(stayId: string, checkInDate: Date, checkOutDate: Date) {
    return prisma.booking.findFirst({
        where: {
            stayId,
            status: "CONFIRMED",
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
        },
    });
}

export async function getOverlappingStayIds(checkInDate: Date, checkOutDate: Date): Promise<string[]> {
    const overlappingBookings = await prisma.booking.findMany({
        where: {
            status: "CONFIRMED",
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
        },
        select: { stayId: true },
    });

    return [...new Set(overlappingBookings.map((b) => b.stayId))];
}

export async function createBooking(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.booking.create({
        data,
    });
}
