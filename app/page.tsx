import Link from "next/link";
import { Box, Container, Typography, Button, Grid, Card, Avatar } from "@mui/material";
import MapIcon from '@mui/icons-material/Map';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box className="animated-bg" sx={{
        position: 'relative',
        height: '80vh',
        minHeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: 'white',
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 6,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
          }}>
            <Typography variant="h1" sx={{ mb: 3, fontWeight: 800, fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Find Your Perfect <Box component="span" sx={{ color: 'secondary.light', textShadow: '0 2px 10px rgba(167, 139, 250, 0.4)' }}>Stay</Box>
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, fontWeight: 400, opacity: 0.9, maxWidth: 600, mx: 'auto', textShadow: '0 1px 5px rgba(0,0,0,0.1)' }}>
              Discover unique apartments in amazing cities. From cozy studios to
              stunning penthouses — your next adventure starts here.
            </Typography>

            <Link href="/stays" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5, px: 4,
                  fontSize: '1.2rem',
                  borderRadius: 8,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'primary.dark',
                  '&:hover': { bgcolor: 'white', transform: 'scale(1.02)' }
                }}
              >
                Start Exploring
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, color: 'text.primary' }}>
              Why StayFinder?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
              We provide the best platform for discovering, reviewing, and booking your next incredible stay, all with just a few clicks.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <MapIcon fontSize="large" />,
                title: "Interactive Map",
                description: "Explore stays spatially with our interactive map. Find the perfect location at a glance.",
              },
              {
                icon: <VerifiedUserIcon fontSize="large" />,
                title: "Verified Reviews",
                description: "Read genuine reviews from real travelers. Post your own to help the community.",
              },
              {
                icon: <LockIcon fontSize="large" />,
                title: "Secure Booking",
                description: "Book with confidence. Our checkout flow is fast, validated, and fully secure.",
              },
            ].map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ width: 80, height: 80, mb: 3, bgcolor: '#ffffff', color: 'primary.main', border: '1px solid', borderColor: 'divider' }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
