import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as StayRepository from "@/lib/data/stays";
import { handleSearchStays, StaySearchValidationError } from "../stay-manager";

// Only database calls are mocked; the booking overlap filter is the real (pure) data-layer helper
vi.mock("@/lib/data/stays", () => ({ getStays: vi.fn() }));
vi.mock("@/lib/data/reviews", () => ({ getAverageRating: vi.fn() }));
vi.mock("@/lib/logger", () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: () => logger };
    return { logger };
});

const getStays = vi.mocked(StayRepository.getStays);

// The Prisma `where` passed to the data layer
const lastWhere = () => getStays.mock.calls.at(-1)?.[0] as Record<string, unknown>;

describe("handleSearchStays availability filtering", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
        vi.clearAllMocks();
        getStays.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should not filter on bookings when no dates are given", async () => {
        await handleSearchStays({});

        expect(lastWhere().bookings).toBeUndefined();
    });

    it("should only return stays with no overlapping confirmed booking, as UTC days", async () => {
        await handleSearchStays({ checkIn: "2026-11-01", checkOut: "2026-11-05" });

        expect(lastWhere().bookings).toEqual({
            none: {
                status: "CONFIRMED",
                checkIn: { lt: new Date("2026-11-05T00:00:00.000Z") },
                checkOut: { gt: new Date("2026-11-01T00:00:00.000Z") },
            },
        });
    });

    it("should search stays in a single query", async () => {
        await handleSearchStays({ checkIn: "2026-11-01", checkOut: "2026-11-05" });

        expect(getStays).toHaveBeenCalledTimes(1);
    });

    it("should combine the date filter with other filters", async () => {
        await handleSearchStays({ query: "Chicago", guests: "4", checkIn: "2026-11-01", checkOut: "2026-11-05" });

        const where = lastWhere();
        expect(where.bookings).toBeDefined();
        expect(where.guests).toEqual({ gte: 4 });
        expect(where.OR).toBeDefined();
    });

    it("should throw a validation error with field details and skip the database", async () => {
        const error = await handleSearchStays({ checkIn: "2026-11-05", checkOut: "2026-11-01" }).catch(e => e);

        expect(error).toBeInstanceOf(StaySearchValidationError);
        expect(error.details.fieldErrors.checkOut).toEqual(["Check-out date must be after check-in date"]);
        expect(getStays).not.toHaveBeenCalled();
    });
});
