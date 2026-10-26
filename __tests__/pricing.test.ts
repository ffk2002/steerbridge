import { describe, it, expect } from 'vitest';

/**
 * Pricing Domain Logic Tests
 *
 * These tests validate the core pricing computation that the booking API uses
 * to calculate total cost. The logic mirrors the calculation in POST /api/bookings.
 */

function calculateTotalPrice(pricePerNight: number, checkIn: Date, checkOut: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay);
    if (nights <= 0) throw new Error('Check-out must be after check-in');
    return pricePerNight * nights;
}

function calculateNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay);
}

function hasDateOverlap(
    reqCheckIn: Date,
    reqCheckOut: Date,
    existingCheckIn: Date,
    existingCheckOut: Date
): boolean {
    return reqCheckIn < existingCheckOut && reqCheckOut > existingCheckIn;
}

describe('Pricing Computations', () => {
    it('calculates total for a single night', () => {
        const total = calculateTotalPrice(
            100,
            new Date('2026-06-01'),
            new Date('2026-06-02')
        );
        expect(total).toBe(100);
    });

    it('calculates total for multiple nights', () => {
        const total = calculateTotalPrice(
            87,
            new Date('2026-06-01'),
            new Date('2026-06-05')
        );
        expect(total).toBe(87 * 4); // 4 nights = $348
    });

    it('calculates total for a 30-day stay', () => {
        const total = calculateTotalPrice(
            150,
            new Date('2026-07-01'),
            new Date('2026-07-31')
        );
        expect(total).toBe(150 * 30);
    });

    it('throws for invalid date range (checkout before checkin)', () => {
        expect(() =>
            calculateTotalPrice(
                100,
                new Date('2026-06-05'),
                new Date('2026-06-01')
            )
        ).toThrow('Check-out must be after check-in');
    });

    it('throws for same-day checkout', () => {
        expect(() =>
            calculateTotalPrice(
                100,
                new Date('2026-06-01'),
                new Date('2026-06-01')
            )
        ).toThrow('Check-out must be after check-in');
    });

    it('handles fractional day rounding (ceil)', () => {
        // 1.5 days should ceil to 2 nights
        const checkIn = new Date('2026-06-01T00:00:00Z');
        const checkOut = new Date('2026-06-02T12:00:00Z');
        const nights = calculateNights(checkIn, checkOut);
        expect(nights).toBe(2);
    });
});

describe('Night Calculations', () => {
    it('returns 1 for consecutive days', () => {
        expect(calculateNights(new Date('2026-01-01'), new Date('2026-01-02'))).toBe(1);
    });

    it('returns 7 for a full week', () => {
        expect(calculateNights(new Date('2026-01-01'), new Date('2026-01-08'))).toBe(7);
    });

    it('handles month boundaries', () => {
        expect(calculateNights(new Date('2026-01-30'), new Date('2026-02-02'))).toBe(3);
    });

    it('handles year boundaries', () => {
        expect(calculateNights(new Date('2025-12-30'), new Date('2026-01-02'))).toBe(3);
    });
});

describe('Availability Overlap Detection', () => {
    const existing = {
        checkIn: new Date('2026-06-10'),
        checkOut: new Date('2026-06-15'),
    };

    it('detects full overlap', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-10'),
                new Date('2026-06-15'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(true);
    });

    it('detects partial overlap (request starts before)', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-08'),
                new Date('2026-06-12'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(true);
    });

    it('detects partial overlap (request ends after)', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-13'),
                new Date('2026-06-18'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(true);
    });

    it('detects enclosing overlap', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-08'),
                new Date('2026-06-18'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(true);
    });

    it('detects contained overlap (request inside existing)', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-11'),
                new Date('2026-06-13'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(true);
    });

    it('allows adjacent booking (checkout = next checkin)', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-15'),
                new Date('2026-06-20'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(false);
    });

    it('allows non-overlapping before', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-01'),
                new Date('2026-06-10'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(false);
    });

    it('allows non-overlapping after', () => {
        expect(
            hasDateOverlap(
                new Date('2026-06-20'),
                new Date('2026-06-25'),
                existing.checkIn,
                existing.checkOut
            )
        ).toBe(false);
    });
});
