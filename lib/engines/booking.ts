export function calculateNights(checkIn: Date, checkOut: Date): number {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateTotalPrice(pricePerNight: number, nights: number): number {
    return pricePerNight * nights;
}

export function validateGuestCapacity(requestedGuests: number, maxGuests: number): boolean {
    return requestedGuests <= maxGuests;
}
