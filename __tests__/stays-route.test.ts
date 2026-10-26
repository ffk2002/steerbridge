import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/stays/route";

vi.mock("@/lib/data/stays", () => ({ getStays: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/data/reviews", () => ({ getAverageRating: vi.fn() }));
vi.mock("@/lib/logger", () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: () => logger };
    return { logger };
});

/**
 * GET /api/stays transport contract: search validation errors become a 400
 * with field-level details the client can show next to the right input.
 */
async function search(query: string) {
    const res = await GET(new NextRequest(`http://localhost/api/stays?${query}`), { params: Promise.resolve({}) });
    return { status: res.status, body: await res.json() };
}

describe("GET /api/stays", () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return stays for a valid date range", async () => {
        const { status, body } = await search("checkIn=2026-11-01&checkOut=2026-11-05");

        expect(status).toBe(200);
        expect(body).toEqual({ stays: [] });
    });

    it("should return 400 with field errors for an invalid range", async () => {
        const { status, body } = await search("checkIn=2026-11-05&checkOut=2026-11-01");

        expect(status).toBe(400);
        expect(body.error).toBe("Validation failed");
        expect(body.details.fieldErrors).toEqual({ checkOut: ["Check-out date must be after check-in date"] });
    });

    it("should report a missing date on the missing field", async () => {
        const { status, body } = await search("checkIn=2026-11-01");

        expect(status).toBe(400);
        expect(body.details.fieldErrors).toEqual({ checkOut: ["Select both check-in and check-out dates"] });
    });

    it("should reject a past check-in", async () => {
        const { status, body } = await search("checkIn=2026-10-01&checkOut=2026-10-05");

        expect(status).toBe(400);
        expect(body.details.fieldErrors).toEqual({ checkIn: ["Check-in date cannot be in the past"] });
    });
});
