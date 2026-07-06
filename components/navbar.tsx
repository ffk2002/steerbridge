"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from "@mui/material/styles";

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '&:hover .MuiSvgIcon-root': { transform: 'scale(1.1)' }
}));

const LogoIcon = styled(TravelExploreIcon)(({ theme }) => ({
    fontSize: 32,
    transition: 'transform 0.2s',
    color: theme.palette.primary.main
}));

const NavLinksContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3)
}));

export function Navbar() {
    const pathname = usePathname();

    return (
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: "space-between", height: 64 }}>
                    {/* Logo */}
                    <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                        <LogoContainer>
                            <LogoIcon />
                            <Typography variant="h6" component="span" fontWeight="bold" color="text.primary">
                                StayFinder
                            </Typography>
                        </LogoContainer>
                    </Link>

                    {/* Nav Links */}
                    <NavLinksContainer>
                        <Link href="/stays" passHref style={{ textDecoration: 'none' }}>
                            <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{
                                    color: pathname.startsWith("/stays") ? 'primary.main' : 'text.secondary',
                                    '&:hover': { color: 'primary.main' },
                                    transition: 'color 0.2s'
                                }}
                            >
                                Explore
                            </Typography>
                        </Link>
                        <Link href="/stays" passHref style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="primary" startIcon={<SearchIcon />}>
                                Search Stays
                            </Button>
                        </Link>
                    </NavLinksContainer>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
