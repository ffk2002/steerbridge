import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getStays(
    where: Prisma.StayWhereInput,
    orderBy: Prisma.StayOrderByWithRelationInput,
    take: number = 50
) {
    return prisma.stay.findMany({
        where,
        orderBy,
        take,
        include: {
            _count: { select: { reviews: true } },
        },
    });
}

export async function getStayById(id: string) {
    const stay = await prisma.stay.findUnique({
        where: { id },
        include: {
            _count: { select: { reviews: true, bookings: true } }
        },
    });
    return stay;
}

export async function getStayBookings(id: string) {
    return prisma.booking.findMany({
        where: {
            stayId: id,
            status: "CONFIRMED",
            checkOut: { gt: new Date() }, // Only future/ongoing
        },
        select: { checkIn: true, checkOut: true },
    });
}
