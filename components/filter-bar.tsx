import { Box, Paper, TextField, InputAdornment, Button, FormControl, Select, MenuItem, ToggleButtonGroup, ToggleButton, SelectChangeEvent, IconButton, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { styled } from "@mui/material/styles";
import { DateErrors } from "@/lib/hooks/use-stays-search";

const SearchPillContainer = styled(Paper)(({ theme }) => ({
    // Full row below lg so the date inputs have room; the sort/view controls wrap underneath
    flex: '1 1 100%',
    minWidth: 0, // let native date inputs shrink on narrow screens
    [theme.breakpoints.up('lg')]: {
        flex: 1,
    },
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        borderRadius: theme.spacing(8),
    },
    alignItems: 'center',
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(0.5),
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        outline: '1px solid',
        outlineColor: theme.palette.primary.main,
        backgroundColor: theme.palette.background.paper
    }
}));

const FilterBarContainer = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    zIndex: 10,
    [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up('lg')]: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    }
}));

const FilterForm = styled('form')({
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16
});

const SearchInputBox = styled(TextField)(({ theme }) => ({
    flex: 1,
    width: '100%',
    '& .MuiInputBase-input': {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
    },
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    [theme.breakpoints.up('md')]: {
        borderBottom: 'none',
        borderRight: '1px solid',
        borderColor: theme.palette.divider,
    }
}));

const DateInputBox = styled(TextField)(({ theme }) => ({
    width: '100%',
    '& input': { minWidth: 0 },
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    '& .MuiInputBase-input': {
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(1),
    },
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    [theme.breakpoints.up('md')]: {
        width: 150,
        borderBottom: 'none',
        borderRight: '1px solid',
        borderColor: theme.palette.divider,
    }
}));

const DateErrorText = styled(Typography)(({ theme }) => ({
    maxWidth: 1200,
    margin: '0 auto',
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
}));

const GuestsInputBox = styled(TextField)(({ theme }) => ({
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    '& .MuiInputBase-input': {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
    },
    [theme.breakpoints.up('md')]: {
        width: 120,
    }
}));

const SearchSubmitButton = styled(Button)(({ theme }) => ({
    height: 48,
    borderRadius: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    margin: theme.spacing(0.5),
    width: `calc(100% - ${theme.spacing(1)})`,
    [theme.breakpoints.up('md')]: {
        borderRadius: theme.spacing(8),
        width: 'auto',
    }
}));

const DesktopSortDropdown = styled(FormControl)(({ theme }) => ({
    minWidth: 160,
    marginLeft: 'auto',
    display: 'none',
    [theme.breakpoints.up('md')]: {
        display: 'block',
    }
}));

const DesktopViewToggles = styled(ToggleButtonGroup)(({ theme }) => ({
    display: 'none',
    height: 40,
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    }
}));

const MobileControlsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginLeft: 'auto',
    [theme.breakpoints.up('md')]: {
        display: 'none',
    }
}));

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    guests: string;
    setGuests: (val: string) => void;
    checkIn: string;
    setCheckIn: (val: string) => void;
    checkOut: string;
    setCheckOut: (val: string) => void;
    dateErrors: DateErrors;
    clearDates: () => void;
    handleSearch: (e?: React.FormEvent, newSortBy?: string) => void;
    sortBy: string;
    handleSortChange: (e: SelectChangeEvent<string>) => void;
    viewMode: "split" | "list" | "map";
    setViewMode: (val: "split" | "list" | "map") => void;
    effectiveMode: "split" | "list" | "map";
}

export function FilterBar({
    searchQuery,
    setSearchQuery,
    guests,
    setGuests,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    dateErrors,
    clearDates,
    handleSearch,
    sortBy,
    handleSortChange,
    viewMode,
    setViewMode,
    effectiveMode
}: FilterBarProps) {
    // Greys out past check-in dates. Check-out has no min, so a too-early check-out reaches the
    // hook's validation and shows the inline message instead of the browser's own popup
    const today = new Date().toISOString().slice(0, 10);
    const dateErrorMessage = dateErrors.checkIn || dateErrors.checkOut;

    return (
        <FilterBarContainer>
            <FilterForm onSubmit={handleSearch}>
                {/* Unified Search Pill */}
                <SearchPillContainer elevation={0}>
                    <SearchInputBox
                        variant="standard"
                        placeholder="Search by city, neighborhood, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: (
                                <InputAdornment position="start" sx={{ pl: 2, pr: 1 }}>
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <DateInputBox
                        variant="standard"
                        type="date"
                        label="Check-in"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        error={!!dateErrors.checkIn}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today, 'aria-describedby': dateErrorMessage ? 'date-error' : undefined }}
                        InputProps={{ disableUnderline: true }}
                    />
                    <DateInputBox
                        variant="standard"
                        type="date"
                        label="Check-out"
                        sx={{ width: { md: 185 } }} // room for the clear button
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        error={!!dateErrors.checkOut}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ 'aria-describedby': dateErrorMessage ? 'date-error' : undefined }}
                        InputProps={{
                            disableUnderline: true,
                            endAdornment: (checkIn || checkOut) && (
                                <InputAdornment position="end">
                                    <IconButton size="small" aria-label="Clear dates" onClick={clearDates}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <GuestsInputBox
                        variant="standard"
                        type="number"
                        placeholder="Guests"
                        inputProps={{ min: 1 }}
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        InputProps={{ disableUnderline: true }}
                    />
                    <SearchSubmitButton type="submit" variant="contained" color="primary">
                        Search
                    </SearchSubmitButton>
                </SearchPillContainer>

                {/* Sort By Dropdown */}
                <DesktopSortDropdown size="small">
                    <Select
                        value={sortBy}
                        onChange={handleSortChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Sort By' }}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            height: 40,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                        }}
                    >
                        <MenuItem value="recommended">Recommended</MenuItem>
                        <MenuItem value="price_asc">Price: Low to High</MenuItem>
                        <MenuItem value="price_desc">Price: High to Low</MenuItem>
                        <MenuItem value="rating_desc">Highest Rated</MenuItem>
                    </Select>
                </DesktopSortDropdown>

                {/* View Toggle — Desktop (3-way: list / split /map) */}
                <DesktopViewToggles
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => { if (newMode) setViewMode(newMode); }}
                    aria-label="view mode"
                    size="medium"
                >
                    <ToggleButton value="list" aria-label="list view"><FormatListBulletedIcon /></ToggleButton>
                    <ToggleButton value="split" aria-label="split view"><VerticalSplitIcon /></ToggleButton>
                    <ToggleButton value="map" aria-label="map view"><MapOutlinedIcon /></ToggleButton>
                </DesktopViewToggles>

                {/* Mobile Sort & Toggle Container */}
                <MobileControlsContainer>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                            value={sortBy}
                            onChange={handleSortChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Sort By' }}
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                height: 36,
                                '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                            }}
                        >
                            <MenuItem value="recommended">Recommended</MenuItem>
                            <MenuItem value="price_asc">Price: Lowest</MenuItem>
                            <MenuItem value="price_desc">Price: Highest</MenuItem>
                            <MenuItem value="rating_desc">Top Rated</MenuItem>
                        </Select>
                    </FormControl>

                    {/* View Toggle — Mobile (2-way: list / map) */}
                    <ToggleButtonGroup
                        value={effectiveMode === "list" || effectiveMode === "split" ? "list" : "map"}
                        exclusive
                        onChange={(e, newMode) => { if (newMode) setViewMode(newMode); }}
                        aria-label="view mode"
                        size="small"
                        sx={{ height: 36 }}
                    >
                        <ToggleButton value="list" aria-label="list view"><FormatListBulletedIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="map" aria-label="map view"><MapOutlinedIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                </MobileControlsContainer>
            </FilterForm>

            {dateErrorMessage && (
                <DateErrorText id="date-error" role="alert" variant="body2" color="error">
                    {dateErrorMessage}
                </DateErrorText>
            )}
        </FilterBarContainer>
    );
}
