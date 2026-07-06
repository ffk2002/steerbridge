import { describe, it, expect } from "vitest";
import { calculateNights, calculateTotalPrice, validateGuestCapacity } from "../booking";
import { sanitizeReviewContent } from "../reviews";

describe("Booking Engine", () => {
    describe("calculateNights", () => {
        it("should calculate exact nights for full days", () => {
            const checkIn = new Date("2024-10-01T00:00:00Z");
            const checkOut = new Date("2024-10-05T00:00:00Z");
            expect(calculateNights(checkIn, checkOut)).toBe(4);
        });

        it("should round up partial nights", () => {
            const checkIn = new Date("2024-10-01T15:00:00Z"); // 3 PM check-in
            const checkOut = new Date("2024-10-05T11:00:00Z"); // 11 AM check-out
            // (1000 * 60 * 60) * 92 hours = 3.83 days -> 4 nights
            expect(calculateNights(checkIn, checkOut)).toBe(4);
        });

        it("should return 1 night for same-day or <24h stays", () => {
            const checkIn = new Date("2024-10-01T15:00:00Z");
            const checkOut = new Date("2024-10-02T11:00:00Z");
            expect(calculateNights(checkIn, checkOut)).toBe(1);
        });
    });

    describe("calculateTotalPrice", () => {
        it("should accurately multiply rate by nights", () => {
            expect(calculateTotalPrice(150, 4)).toBe(600);
            expect(calculateTotalPrice(0, 10)).toBe(0);
        });
    });

    describe("validateGuestCapacity", () => {
        it("should allow guests equal to max capacity", () => {
            expect(validateGuestCapacity(4, 4)).toBe(true);
        });

        it("should reject guests exceeding max capacity", () => {
            expect(validateGuestCapacity(5, 4)).toBe(false);
        });

        it("should allow 1 guest in a large house", () => {
            expect(validateGuestCapacity(1, 10)).toBe(true);
        });
    });
});

describe("Reviews Engine", () => {
    describe("sanitizeReviewContent", () => {
        it("should allow safe text content", () => {
            expect(sanitizeReviewContent("This is a lovely place to stay!")).toBe("This is a lovely place to stay!");
        });

        it("should strip <script> tags", () => {
            expect(sanitizeReviewContent("Great stay <script>alert(1)</script>")).toBe("Great stay alert(1)");
        });

        it("should strip embedded iframe tags", () => {
            expect(sanitizeReviewContent("Nice <iframe src='evil.com'></iframe> views")).toBe("Nice  views");
        });
    });
});
