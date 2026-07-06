import { Card, Typography, TextField, Stack, Divider, Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useBooking } from "@/lib/hooks/use-booking";

interface BookingWidgetProps {
    stayId: string;
    stayPrice: number;
    maxGuests: number;
}



const StyledBookingCard = styled(Card)(({ theme }) => ({
    position: 'sticky',
    top: 100,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
}));

export function BookingWidget({
    stayId,
    stayPrice,
    maxGuests
}: BookingWidgetProps) {
    const {
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        bookingGuests,
        setBookingGuests,
        createBooking,
        nights
    } = useBooking(stayId);

    return (
        <StyledBookingCard>
            <Stack direction="row" alignItems="baseline" gap={1} mb={4}>
                <Typography variant="h4" fontWeight="bold">${stayPrice}</Typography>
                <Typography color="text.secondary" variant="h6" fontWeight="regular">/ night</Typography>
            </Stack>

            <Stack spacing={3} mb={4}>
                <Stack direction="row" spacing={2} sx={{ '& .MuiTextField-root': { flex: 1 } }}>
                    <TextField
                        type="date"
                        label="Check-in"
                        InputLabelProps={{ shrink: true }}
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                    />
                    <TextField
                        type="date"
                        label="Check-out"
                        InputLabelProps={{ shrink: true }}
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                    />
                </Stack>
                <TextField
                    type="number"
                    label="Guests"
                    inputProps={{ min: 1, max: maxGuests }}
                    value={bookingGuests}
                    onChange={e => setBookingGuests(parseInt(e.target.value) || 1)}
                />
            </Stack>

            {nights > 0 && (
                <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">${stayPrice} × {nights} nights</Typography>
                        <Typography fontWeight="medium">${stayPrice * nights}</Typography>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight="bold" fontSize="1.1rem">Total</Typography>
                        <Typography fontWeight="bold" fontSize="1.1rem">${stayPrice * nights}</Typography>
                    </Stack>
                </Box>
            )}

            <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                onClick={() => createBooking.mutate()}
                disabled={createBooking.isPending || !checkIn || !checkOut || nights <= 0}
                sx={{ height: 56, fontSize: '1.1rem' }}
            >
                {createBooking.isPending ? "Processing..." : "Reserve"}
            </Button>

            {createBooking.isError && (
                <Typography color="error" variant="body2" textAlign="center" mt={2}>
                    {createBooking.error?.message || "Booking failed. Please try again."}
                </Typography>
            )}

            {createBooking.isSuccess && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#ecfdf5', color: '#065f46', textAlign: 'center', border: '1px solid #10b981' }}>
                    <Typography fontWeight="bold">✓ Booking confirmed!</Typography>
                </Box>
            )}
        </StyledBookingCard>
    );
}
