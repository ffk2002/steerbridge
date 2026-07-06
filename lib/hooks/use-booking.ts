import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

async function submitBooking(data: { stayId: string; checkIn: string; checkOut: string; guests: number }) {
    const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...data,
            idempotencyKey: crypto.randomUUID(),
        }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Booking failed");
    }
    return res.json();
}

export function useBooking(stayId: string) {
    const router = useRouter();
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [bookingGuests, setBookingGuests] = useState(1);

    const createBooking = useMutation({
        mutationFn: () => submitBooking({
            stayId,
            checkIn: new Date(checkIn).toISOString(),
            checkOut: new Date(checkOut).toISOString(),
            guests: bookingGuests,
        }),
        onSuccess: (data: { booking: { totalPrice: number } }) => {
            router.replace(`/stays/${stayId}?booked=true&total=${data.booking.totalPrice}`, { scroll: false });
        },
    });

    const nights =
        checkIn && checkOut
            ? Math.ceil(
                  (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

    return {
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        bookingGuests,
        setBookingGuests,
        createBooking,
        nights,
    };
}
