import { z } from "zod";

export const BookingSchema = z.object({
    id: z.string().uuid(),
    stayId: z.string().uuid(),
    userId: z.string(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.number().int().positive(),
    totalPrice: z.number().positive(),
    status: z.enum(["CONFIRMED", "CANCELLED"]),
    idempotencyKey: z.string(),
    createdAt: z.coerce.date(),
});

export type Booking = z.infer<typeof BookingSchema>;

export const CreateBookingRequestSchema = z.object({
    stayId: z.string().uuid(),
    checkIn: z.string().datetime({ offset: true }),
    checkOut: z.string().datetime({ offset: true }),
    guests: z.number().int().positive().min(1),
    idempotencyKey: z.string().uuid("Must be a valid UUID v4 string"),
})
    .refine(data => {
        const checkIn = new Date(data.checkIn);
        const now = new Date();
        // Compare UTC calendar dates only to avoid local-timezone shifting
        const checkInDay = Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate());
        const todayDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        return checkInDay >= todayDay;
    }, {
        message: "Check-in date cannot be in the past",
        path: ["checkIn"],
    })
    .refine(data => new Date(data.checkIn) < new Date(data.checkOut), {
        message: "Check-out date must be strictly after the check-in date",
        path: ["checkOut"],
    });
