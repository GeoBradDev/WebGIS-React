import { useState } from 'react';
import { Typography, TextField, Button, Paper, Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import useStore from '../src/store/useStore';
import {bounds} from "leaflet/src/geometry/index.js";

function Sidebar({ setMapCenter }) {
    const [searchText, setSearchText] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse
    const setBounds = useStore(state => state.setBounds);


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
                const { lat, lon } = results[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                const {boundingbox} = results[0]
                const [south, north, west, east] = boundingbox.map(parseFloat)
                setBounds([[south, west], [north, east]])
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100%' }}>
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
                    sx={{ alignSelf: 'flex-end', marginBottom: 2 }}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>

                {!isCollapsed && (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ marginTop: 2 }}>
                            <Typography variant="h6">Search Location</Typography>
                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSearch(); // Trigger the search when the form is submitted
                                }}
                            >
                                <TextField
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    sx={{ marginBottom: 1 }}
                                />
                                <Button
                                    type="submit" // Set the button type to "submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    Search
                                </Button>
                            </Box>
                        </Box>
                        <Typography variant="h6">Query Data</Typography>
                        <Box
                            component="form"
                            onSubmit={handleFormSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    Submit
                                </Button>
                                <Button type="reset" variant="contained" color="secondary">
                                    Reset
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default Sidebar;
