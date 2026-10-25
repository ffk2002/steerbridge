import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as StayRepository from "@/lib/data/stays";
import * as BookingRepository from "@/lib/data/bookings";
import { handleSearchStays, StaySearchValidationError } from "../stay-manager";

vi.mock("@/lib/data/stays", () => ({ getStays: vi.fn() }));
vi.mock("@/lib/data/reviews", () => ({ getAverageRating: vi.fn() }));
vi.mock("@/lib/data/bookings", () => ({ getOverlappingStayIds: vi.fn() }));
vi.mock("@/lib/logger", () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: () => logger };
    return { logger };
});

const getStays = vi.mocked(StayRepository.getStays);
const getOverlappingStayIds = vi.mocked(BookingRepository.getOverlappingStayIds);

// The Prisma `where` passed to the data layer
const lastWhere = () => getStays.mock.calls.at(-1)?.[0] as Record<string, unknown>;

describe("handleSearchStays availability filtering", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
        vi.clearAllMocks();
        getStays.mockResolvedValue([]);
        getOverlappingStayIds.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should not query bookings when no dates are given", async () => {
        await handleSearchStays({});

        expect(getOverlappingStayIds).not.toHaveBeenCalled();
        expect(lastWhere().id).toBeUndefined();
    });

    it("should look up overlaps for the requested days as UTC midnight", async () => {
        await handleSearchStays({ checkIn: "2026-11-01", checkOut: "2026-11-05" });

        expect(getOverlappingStayIds).toHaveBeenCalledWith(
            new Date("2026-11-01T00:00:00.000Z"),
            new Date("2026-11-05T00:00:00.000Z")
        );
    });

    it("should exclude stays with overlapping bookings", async () => {
        getOverlappingStayIds.mockResolvedValue(["stay-a", "stay-b"]);

        await handleSearchStays({ checkIn: "2026-11-01", checkOut: "2026-11-05" });

        expect(lastWhere().id).toEqual({ notIn: ["stay-a", "stay-b"] });
    });

    it("should not add an id filter when nothing overlaps", async () => {
        await handleSearchStays({ checkIn: "2026-11-01", checkOut: "2026-11-05" });

        expect(lastWhere().id).toBeUndefined();
    });

    it("should combine the date filter with other filters", async () => {
        getOverlappingStayIds.mockResolvedValue(["stay-a"]);

        await handleSearchStays({ query: "Chicago", guests: "4", checkIn: "2026-11-01", checkOut: "2026-11-05" });

        const where = lastWhere();
        expect(where.id).toEqual({ notIn: ["stay-a"] });
        expect(where.guests).toEqual({ gte: 4 });
        expect(where.OR).toBeDefined();
    });

    it("should throw a validation error with field details and skip the database", async () => {
        const error = await handleSearchStays({ checkIn: "2026-11-05", checkOut: "2026-11-01" }).catch(e => e);

        expect(error).toBeInstanceOf(StaySearchValidationError);
        expect(error.details.fieldErrors.checkOut).toEqual(["Check-out date must be after check-in date"]);
        expect(getOverlappingStayIds).not.toHaveBeenCalled();
        expect(getStays).not.toHaveBeenCalled();
    });
});
