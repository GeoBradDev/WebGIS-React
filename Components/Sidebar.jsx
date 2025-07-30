import { useState } from 'react';
import { Typography, TextField, Button, Paper, Box, IconButton, Checkbox, FormControlLabel, Divider, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, Clear } from '@mui/icons-material';
import PropTypes from 'prop-types';
import useStore from '../src/store/useStore';

function Sidebar({ setMapCenter }) {
    const [searchText, setSearchText] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse
    const setBounds = useStore(state => state.setBounds);
    const layers = useStore(state => state.layers);
    const toggleLayerVisibility = useStore(state => state.toggleLayerVisibility);
    const filters = useStore(state => state.filters);
    const setFilters = useStore(state => state.setFilters);
    const resetFilters = useStore(state => state.resetFilters);
    const getUniqueMunicipalities = useStore(state => state.getUniqueMunicipalities);
    const getUniqueMunicodes = useStore(state => state.getUniqueMunicodes);


    const handleFormSubmit = (event) => {
        event.preventDefault();
    };

    const handleFilterChange = (field, value) => {
        setFilters({ [field]: value });
    };

    const handleResetFilters = () => {
        resetFilters();
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

    const handleClearSearch = () => {
        setSearchText('');
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
                                    slotProps={{
                                        input: {
                                            endAdornment: searchText && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClearSearch}
                                                        edge="end"
                                                        size="small"
                                                        aria-label="clear search"
                                                    >
                                                        <Clear />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
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
                        
                        <Divider sx={{ marginY: 2 }} />
                        
                        {/* Layer Control Section */}
                        <Box sx={{ marginBottom: 2 }}>
                            <Typography variant="h6" sx={{ marginBottom: 2 }}>Map Layers</Typography>
                            {Object.values(layers).map((layer) => (
                                <FormControlLabel
                                    key={layer.id}
                                    control={
                                        <Checkbox
                                            checked={layer.visible}
                                            onChange={() => toggleLayerVisibility(layer.id)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{layer.name}</span>
                                            {layer.id === 'st-louis-municipalities' && (
                                                <Box
                                                    sx={{
                                                        width: 50,
                                                        height: 25,
                                                        backgroundColor: 'rgba(0, 0, 255, 0.3)',
                                                        border: '2px solid blue',
                                                        borderRadius: 0.5,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    sx={{ 
                                        display: 'flex', 
                                        width: '100%',
                                        marginBottom: 0.5 
                                    }}
                                />
                            ))}
                        </Box>
                        
                        <Divider sx={{ marginY: 2 }} />
                        
                        <Typography variant="h6">Query Attribute Data</Typography>
                        <Box
                            component="form"
                            onSubmit={handleFormSubmit}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <FormControl fullWidth size="small">
                                <InputLabel>Municipality Names</InputLabel>
                                <Select
                                    multiple
                                    variant="outlined"
                                    value={filters.municipality}
                                    onChange={(e) => handleFilterChange('municipality', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {getUniqueMunicipalities().map((name) => (
                                        <MenuItem key={name} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth size="small">
                                <InputLabel>Municipal Codes</InputLabel>
                                <Select
                                    multiple
                                    variant="outlined"
                                    value={filters.municode}
                                    onChange={(e) => handleFilterChange('municode', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {getUniqueMunicodes().map((code) => (
                                        <MenuItem key={code} value={code}>
                                            {code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Min Area (sq mi)"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={filters.areaMin}
                                    onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                                    placeholder="0"
                                    inputProps={{ step: "0.01" }}
                                />
                                <TextField
                                    label="Max Area (sq mi)"
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    value={filters.areaMax}
                                    onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                                    placeholder="100"
                                    inputProps={{ step: "0.01" }}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    Apply Filters
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="contained" 
                                    color="secondary"
                                    onClick={handleResetFilters}
                                >
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

Sidebar.propTypes = {
    setMapCenter: PropTypes.func.isRequired,
};

export default Sidebar;
