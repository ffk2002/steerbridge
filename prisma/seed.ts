import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// ---------- Synthetic Data Generators ----------

const CITIES = [
    { name: "New York, USA", lat: 40.7128, lng: -74.006 },
    { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437 },
    { name: "Chicago, USA", lat: 41.8781, lng: -87.6298 },
    { name: "Miami, USA", lat: 25.7617, lng: -80.1918 },
    { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194 },
    { name: "Austin, USA", lat: 30.2672, lng: -97.7431 },
    { name: "Seattle, USA", lat: 47.6062, lng: -122.3321 },
    { name: "Denver, USA", lat: 39.7392, lng: -104.9903 },
    { name: "Portland, USA", lat: 45.5051, lng: -122.675 },
    { name: "Nashville, USA", lat: 36.1627, lng: -86.7816 },
];

const ADJECTIVES = [
    "Cozy", "Modern", "Stunning", "Charming", "Luxury", "Rustic", "Spacious",
    "Bright", "Serene", "Elegant", "Bohemian", "Minimalist", "Stylish", "Warm",
];

const TYPES = [
    "Loft", "Studio", "Apartment", "Penthouse", "Flat", "Suite", "Condo",
    "Townhouse", "Duplex", "Bungalow",
];

const NEIGHBORHOODS = [
    "Downtown", "Midtown", "Arts District", "Waterfront", "Historic Quarter",
    "University Area", "Riverside", "Uptown", "Old Town", "Garden District",
];

const HOST_NAMES = [
    "Sarah M.", "James K.", "Maria L.", "David R.", "Emily W.",
    "Carlos G.", "Jessica T.", "Michael B.", "Amanda C.", "Daniel F.",
];

const AMENITIES_POOL = [
    "WiFi", "Kitchen", "Air Conditioning", "Heating", "Washer", "Dryer",
    "TV", "Iron", "Hair Dryer", "Smoke Detector", "Fire Extinguisher",
    "First Aid Kit", "Dedicated Workspace", "Pool", "Hot Tub", "Gym",
    "Free Parking", "EV Charger", "Coffee Maker", "Dishwasher",
];

const REVIEW_CONTENTS = [
    "This place was absolutely amazing! The location was perfect and the host was incredibly responsive.",
    "Great stay overall. Clean, well-maintained, and exactly as described in the listing.",
    "Beautiful apartment with stunning views. Would definitely recommend to anyone visiting the city.",
    "The apartment was cozy and had everything we needed. Perfect for a weekend getaway.",
    "Excellent location, walking distance to restaurants and attractions. Very comfortable beds.",
    "A hidden gem! The decor was tasteful and the neighborhood was quiet yet close to everything.",
    "Loved our stay here. The kitchen was fully stocked and the WiFi was lightning fast.",
    "Perfect for remote work. The dedicated workspace was a huge plus. Very clean and modern.",
    "The host went above and beyond to make us feel welcome. Would book again in a heartbeat.",
    "Spacious and well-lit apartment. The building was secure and the check-in process was seamless.",
];

const REVIEWER_NAMES = [
    "Alex P.", "Jordan S.", "Taylor M.", "Casey R.", "Morgan W.",
    "Riley K.", "Quinn H.", "Avery D.", "Jamie L.", "Drew T.",
];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

function jitter(base: number, range: number): number {
    return base + (Math.random() - 0.5) * range;
}

// Curated apartment/interior images from Unsplash, grouped by style
const INTERIOR_IMAGES: Record<string, string[]> = {
    modern: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    ],
    cozy: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=600&fit=crop",
    ],
    luxury: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&h=600&fit=crop",
    ],
    bright: [
        "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    ],
    rustic: [
        "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=800&h=600&fit=crop",
    ],
};

// Map adjective to an image style
const ADJ_TO_STYLE: Record<string, string> = {
    Cozy: "cozy", Warm: "cozy", Charming: "cozy", Bohemian: "cozy",
    Modern: "modern", Minimalist: "modern", Stylish: "modern",
    Luxury: "luxury", Stunning: "luxury", Elegant: "luxury",
    Bright: "bright", Spacious: "bright", Serene: "bright",
    Rustic: "rustic",
};

function getImagesForStyle(adj: string): string[] {
    const style = ADJ_TO_STYLE[adj] || "modern";
    const pool = INTERIOR_IMAGES[style];
    // Pick 4 random images from the pool without repeats
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
}

function generateStay(city: typeof CITIES[number]) {
    const adj = pick(ADJECTIVES);
    const type = pick(TYPES);
    const neighborhood = pick(NEIGHBORHOODS);
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const beds = bedrooms + Math.floor(Math.random() * 2);
    const baths = Math.max(1, bedrooms - Math.floor(Math.random() * 2));
    const guests = beds * 2;
    const price = Math.floor(Math.random() * 350) + 50; // $50-$400/night
    const amenities = pickN(AMENITIES_POOL, Math.floor(Math.random() * 8) + 5);

    return {
        id: randomUUID(),
        title: `${adj} ${type} in ${neighborhood}`,
        description: `Experience this ${adj.toLowerCase()} ${type.toLowerCase()} located in the heart of ${neighborhood}, ${city.name}. Featuring ${bedrooms} bedroom(s), ${beds} bed(s), and ${baths} bath(s). Perfect for travelers looking for a comfortable and memorable stay. Enjoy amenities like ${amenities.slice(0, 3).join(", ")}, and more.`,
        location: city.name,
        latitude: jitter(city.lat, 0.08),
        longitude: jitter(city.lng, 0.08),
        price,
        guests,
        bedrooms,
        beds,
        baths,
        amenities: JSON.stringify(amenities),
        images: JSON.stringify(getImagesForStyle(adj)),
        hostId: randomUUID(),
        hostName: pick(HOST_NAMES),
    };
}

function generateReview(stayId: string) {
    return {
        id: randomUUID(),
        stayId,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        content: pick(REVIEW_CONTENTS),
        authorId: randomUUID(),
        authorName: pick(REVIEWER_NAMES),
    };
}

function generateBooking(stayId: string, price: number) {
    const checkInOffset = Math.floor(Math.random() * 30) + 1;
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + checkInOffset);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);

    return {
        id: randomUUID(),
        stayId,
        userId: randomUUID(),
        checkIn,
        checkOut,
        guests: Math.floor(Math.random() * 4) + 1,
        totalPrice: price * nights,
        status: "CONFIRMED",
        idempotencyKey: randomUUID(),
    };
}

// ---------- Main Seed Function ----------

async function main() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await prisma.booking.deleteMany();
    await prisma.review.deleteMany();
    await prisma.stay.deleteMany();

    console.log("  ✓ Cleared existing data");

    const STAYS_PER_CITY = 10;
    const allStays: ReturnType<typeof generateStay>[] = [];

    for (const city of CITIES) {
        for (let i = 0; i < STAYS_PER_CITY; i++) {
            allStays.push(generateStay(city));
        }
    }

    // Batch insert stays
    await prisma.stay.createMany({ data: allStays });
    console.log(`  ✓ Seeded ${allStays.length} stays across ${CITIES.length} cities`);

    // Generate reviews (3-8 per stay)
    const allReviews = allStays.flatMap((stay) => {
        const reviewCount = Math.floor(Math.random() * 6) + 3;
        return Array.from({ length: reviewCount }, () => generateReview(stay.id));
    });

    await prisma.review.createMany({ data: allReviews });
    console.log(`  ✓ Seeded ${allReviews.length} reviews`);

    // Generate bookings (1-3 per stay)
    const allBookings = allStays.flatMap((stay) => {
        const bookingCount = Math.floor(Math.random() * 3) + 1;
        return Array.from({ length: bookingCount }, () =>
            generateBooking(stay.id, stay.price)
        );
    });

    await prisma.booking.createMany({ data: allBookings });
    console.log(`  ✓ Seeded ${allBookings.length} bookings`);

    console.log("🎉 Database seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
