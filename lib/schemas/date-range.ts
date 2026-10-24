import { z } from "zod";

// Calendar date in YYYY-MM-DD form, interpreted as a UTC day
export const DateOnlySchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(value => {
        // Reject dates that roll over, e.g. 2026-02-30 -> 2026-03-02
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    }, "Date is not a valid calendar date");

function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

type DateRangeInput = { checkIn?: string; checkOut?: string };

/**
 * Adds the shared trip date rules to a schema with optional checkIn/checkOut:
 * - both dates or neither
 * - check-in is not in the past (UTC calendar day)
 * - check-out is strictly after check-in
 *
 * YYYY-MM-DD strings compare correctly as plain strings.
 */
export function refineDateRange<T extends z.ZodType<DateRangeInput>>(schema: T) {
    return schema.superRefine((data, ctx) => {
        const { checkIn, checkOut } = data;

        if (!checkIn && !checkOut) return;

        if (!checkIn || !checkOut) {
            ctx.addIssue({
                code: "custom",
                message: "Select both check-in and check-out dates",
                path: [checkIn ? "checkOut" : "checkIn"],
            });
            return;
        }

        // Zod still runs object refinements after field errors; the field already reported a malformed date
        if (!DateOnlySchema.safeParse(checkIn).success || !DateOnlySchema.safeParse(checkOut).success) return;

        if (checkIn < todayUtc()) {
            ctx.addIssue({
                code: "custom",
                message: "Check-in date cannot be in the past",
                path: ["checkIn"],
            });
        }

        if (checkOut <= checkIn) {
            ctx.addIssue({
                code: "custom",
                message: "Check-out date must be after check-in date",
                path: ["checkOut"],
            });
        }
    });
}
