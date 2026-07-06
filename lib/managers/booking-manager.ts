import { CreateBookingRequestSchema } from "@/lib/schemas/booking";
import * as BookingRepository from "@/lib/data/bookings";
import * as StayRepository from "@/lib/data/stays";
import * as BookingEngine from "@/lib/engines/booking";
import { z } from "zod";
import { logger as globalLogger } from "@/lib/logger";

type Logger = typeof globalLogger;

export class BookingCreationError extends Error {
    constructor(public message: string, public statusCode: number = 400, public details?: unknown) {
        super(message);
        this.name = "BookingCreationError";
    }
}

export type CreateBookingInput = z.infer<typeof CreateBookingRequestSchema>;

export async function handleCreateBooking(parsedData: CreateBookingInput, logger: Logger = globalLogger) {
    const { stayId, checkIn, checkOut, guests, idempotencyKey } = parsedData;

    logger.debug({ stayId, checkIn, checkOut, guests, idempotencyKey }, "Starting booking creation process");

    // Idempotency check
    const existingBooking = await BookingRepository.getBookingByIdempotencyKey(idempotencyKey);
    if (existingBooking) {
        logger.info({ bookingId: existingBooking.id, idempotencyKey }, "Idempotency key hit, returning existing booking");
        return { booking: existingBooking, isIdempotencyHit: true, stayId };
    }

    // Verify stay exists
    const stay = await StayRepository.getStayById(stayId);
    if (!stay) {
        throw new BookingCreationError("Stay not found", 404);
    }

    // Validate capacity via pure Engine logic
    if (!BookingEngine.validateGuestCapacity(guests, stay.guests)) {
        throw new BookingCreationError(`This stay supports a maximum of ${stay.guests} guests`, 400);
    }

    // Check availability via Data Layer
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const overlapping = await BookingRepository.getOverlappingBookings(stayId, checkInDate, checkOutDate);

    if (overlapping) {
        logger.warn({ stayId, checkIn, checkOut }, "Booking failed due to overlapping dates");
        throw new BookingCreationError("This stay is not available for the selected dates", 409);
    }

    // Calculate price via pure Engine logic
    const nights = BookingEngine.calculateNights(checkInDate, checkOutDate);
    const totalPrice = BookingEngine.calculateTotalPrice(stay.price, nights);

    // Create Booking via Data Layer
    const booking = await BookingRepository.createBooking({
        stayId,
        userId: "anonymous", // Local app uses anonymous identity.
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: "CONFIRMED",
        idempotencyKey,
    });

    logger.info({ bookingId: booking.id, totalPrice }, "Successfully created new booking");
    return { booking, isIdempotencyHit: false, stayId, totalPrice };
}
