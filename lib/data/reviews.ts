import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getReviewsByStay(stayId: string, page: number, pageSize: number) {
    return prisma.review.findMany({
        where: { stayId },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: (page - 1) * pageSize,
    });
}

export async function getReviewCount(stayId: string) {
    return prisma.review.count({ where: { stayId } });
}

export async function getAverageRating(stayId: string) {
    const avgRating = await prisma.review.aggregate({
        where: { stayId },
        _avg: { rating: true },
    });
    return avgRating._avg.rating ?? 0;
}

export async function createReview(data: Prisma.ReviewUncheckedCreateInput) {
    return prisma.review.create({
        data,
    });
}
