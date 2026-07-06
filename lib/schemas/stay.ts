import { z } from "zod";

export const StaySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(20),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number().positive(),
  guests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  beds: z.number().int().nonnegative(),
  baths: z.number().nonnegative(),
  amenities: z.string(), // Extracted locally as JSON
  images: z.string(), // Extracted locally as JSON
  hostId: z.string(),
  hostName: z.string(),
});

export type Stay = z.infer<typeof StaySchema>;

// Schema for the GET /api/stays query parameters
export const StaySearchQuerySchema = z.object({
  query: z.string().optional(),
  guests: z.coerce.number().int().positive().optional(),
  checkIn: z.string().datetime({ offset: true }).optional(),
  checkOut: z.string().datetime({ offset: true }).optional(),
  sw_lat: z.coerce.number().optional(), // Map Bounds: South West Latitude
  sw_lng: z.coerce.number().optional(),
  ne_lat: z.coerce.number().optional(), // Map Bounds: North East Latitude
  ne_lng: z.coerce.number().optional(),
}).refine(data => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkIn) < new Date(data.checkOut);
  }
  return true;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});
