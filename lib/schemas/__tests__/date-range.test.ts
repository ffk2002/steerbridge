import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DateOnlySchema } from "../date-range";
import { StaySearchQuerySchema } from "../stay";

function issuePaths(input: unknown) {
    const result = StaySearchQuerySchema.safeParse(input);
    return result.success ? [] : result.error.issues.map(issue => issue.path.join("."));
}

describe("DateOnlySchema", () => {
    it("should accept a valid YYYY-MM-DD date", () => {
        expect(DateOnlySchema.safeParse("2026-11-01").success).toBe(true);
        expect(DateOnlySchema.safeParse("2028-02-29").success).toBe(true); // leap day
    });

    it("should reject impossible calendar dates", () => {
        expect(DateOnlySchema.safeParse("2026-02-30").success).toBe(false);
        expect(DateOnlySchema.safeParse("2026-13-01").success).toBe(false);
        expect(DateOnlySchema.safeParse("2027-02-29").success).toBe(false);
    });

    it("should reject other formats", () => {
        expect(DateOnlySchema.safeParse("2026-11-01T00:00:00.000Z").success).toBe(false);
        expect(DateOnlySchema.safeParse("11/01/2026").success).toBe(false);
        expect(DateOnlySchema.safeParse("2026-1-1").success).toBe(false);
        expect(DateOnlySchema.safeParse("").success).toBe(false);
    });
});

describe("StaySearchQuerySchema date range", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should accept a search without dates", () => {
        expect(issuePaths({})).toEqual([]);
        expect(issuePaths({ query: "Paris", guests: "2" })).toEqual([]);
    });

    it("should accept a valid future range", () => {
        expect(issuePaths({ checkIn: "2026-11-01", checkOut: "2026-11-05" })).toEqual([]);
    });

    it("should accept a check-in of today", () => {
        expect(issuePaths({ checkIn: "2026-10-24", checkOut: "2026-10-25" })).toEqual([]);
    });

    it("should reject a check-in without a check-out", () => {
        expect(issuePaths({ checkIn: "2026-11-01" })).toEqual(["checkOut"]);
    });

    it("should reject a check-out without a check-in", () => {
        expect(issuePaths({ checkOut: "2026-11-05" })).toEqual(["checkIn"]);
    });

    it("should reject a check-in in the past", () => {
        expect(issuePaths({ checkIn: "2026-10-23", checkOut: "2026-10-25" })).toEqual(["checkIn"]);
    });

    it("should reject a check-out equal to check-in", () => {
        expect(issuePaths({ checkIn: "2026-11-01", checkOut: "2026-11-01" })).toEqual(["checkOut"]);
    });

    it("should reject a check-out before check-in", () => {
        expect(issuePaths({ checkIn: "2026-11-05", checkOut: "2026-11-01" })).toEqual(["checkOut"]);
    });

    it("should report malformed dates on the right field", () => {
        expect(issuePaths({ checkIn: "2026-02-30", checkOut: "2026-03-05" })).toEqual(["checkIn"]);
    });
});
