import {useState} from 'react';
import {Typography, TextField, Button, Paper, Box, IconButton} from '@mui/material';
import {ChevronLeft, ChevronRight, Clear, Room} from '@mui/icons-material';

function Sidebar({setMapCenter}) {
    const [searchText, setSearchText] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse

    const handleFormSubmit = (event) => {
        event.preventDefault();
    };

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchText
                )}`
            );
            const results = await response.json();
            if (results.length > 0) {
                const {lat, lon} = results[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    return (
        <Box sx={{display: 'flex', height: '100%'}}>
            <Paper
                sx={{
                    width: isCollapsed ? '50px' : '300px',
                    transition: 'width 0.3s',
                    padding: isCollapsed ? 1 : 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <IconButton
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    sx={{alignSelf: 'flex-end', marginBottom: 2}}
                >
                    {isCollapsed ? <ChevronRight/> : <ChevronLeft/>}
                </IconButton>

                {!isCollapsed && (
                    <Box sx={{width: '100%'}}>
                        <Box>
                            <Typography variant="h6">Go to Location</Typography>
                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSearch();
                                }}
                            >
                                <TextField
                                    label="Type Location..."
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    sx={{marginBottom: 1}}
                                    InputProps={{
                                        endAdornment: searchText && (
                                            <IconButton
                                                size="small"
                                                onClick={() => setSearchText('')}
                                                aria-label="clear search"
                                                edge="end"
                                            >
                                                <Clear fontSize="small"/>
                                            </IconButton>
                                        ),
                                    }}
                                />
                                <Box sx={{display: 'flex', gap: 1}}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Go
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        color="secondary"
                                        fullWidth
                                        onClick={() => setSearchText('')}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                                <Box sx={{marginTop: 2}}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        fullWidth
                                        startIcon={<Room/>}
                                        onClick={() => {
                                            alert("Adopt an Area clicked!");
                                        }}
                                        sx={{
                                            marginTop: 1,
                                            fontWeight: 'bold',
                                            paddingY: 1.2,
                                            textTransform: 'none',
                                        }}
                                    >
                                        Adopt an Area
                                    </Button>
                                </Box>
                                <Typography variant="h6" sx={{mt: 2}}>Query Data</Typography>
                                <Box
                                    component="form"
                                    onSubmit={handleFormSubmit}
                                    sx={{display: 'flex', flexDirection: 'column', gap: 2}}
                                >
                                    <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
                                        <Button type="submit" variant="contained" color="primary">
                                            Submit
                                        </Button>
                                        <Button type="reset" variant="contained" color="secondary">
                                            Reset
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default Sidebar;
