import { NextResponse } from "next/server";
import { withAction } from "@/lib/api-utils";
import { handleCreateBooking, BookingCreationError } from "@/lib/managers/booking-manager";
import { CreateBookingRequestSchema } from "@/lib/schemas/booking";

export const POST = withAction(async (request, { logger: actionLogger }) => {
    const body = await request.json();
    
    // 1. Validate Input (API Boundary Contract)
    const parsed = CreateBookingRequestSchema.safeParse(body);
    if (!parsed.success) {
        actionLogger.warn({ details: parsed.error.flatten() }, "Validation failed at API Boundary");
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    try {
        // 2. Delegate to Manager
        const result = await handleCreateBooking(parsed.data, actionLogger);

        const stayLogger = actionLogger.child({ stay_id: result.stayId });

        if (result.isIdempotencyHit) {
            stayLogger.info({ bookingId: result.booking.id, idempotencyKey: result.booking.idempotencyKey }, "Booking already exists (Idempotency Hit)");
            return NextResponse.json({ booking: result.booking }, { status: 200 });
        }

        stayLogger.info({ bookingId: result.booking.id, totalPrice: result.totalPrice }, "Booking created successfully");
        return NextResponse.json({ booking: result.booking }, { status: 201 });

    } catch (error) {
        if (error instanceof BookingCreationError) {
            if (error.statusCode === 404) {
                actionLogger.warn("Stay not found");
            } else {
                 actionLogger.warn({ message: error.message }, "Booking domain conflict");
            }

            return NextResponse.json(
                { error: error.message, details: error.details },
                { status: error.statusCode }
            );
        }

        // Bubbles up to withAction for 500
        throw error;
    }
});
