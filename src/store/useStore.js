import {create} from 'zustand';

const useStore = create((set, get) => ({
    defaultCenter: [38.64, -90.3], // Default map center
    mapCenter: [38.64, -90.3], // Default map center
    setMapCenter: (newCenter) => set({mapCenter: newCenter}),

    userLocation: null,
    setUserLocation: (location) => {
        set(() => ({userLocation: location ? [...location] : null})); // Ensure a new array reference
    },

    currentView: 'map',
    toggleView: () =>
        set((state) => ({
            currentView: state.currentView === 'map' ? 'dashboard' : 'map',
        })),

    isTableCollapsed: true,
    toggleTable: () => set((state) => ({isTableCollapsed: !state.isTableCollapsed})),

    aboutOpen: false, // State for dialog

    geojsonData: null,
    isDataLoaded: false,
    bounds: null,
    setBounds: (bounds) => set({bounds}),

    // Layer visibility state
    layers: {
        'st-louis-municipalities': {
            id: 'st-louis-municipalities',
            name: 'St. Louis Municipalities',
            visible: true,
            data: null,
        }
    },
    
    toggleLayerVisibility: (layerId) => set((state) => ({
        layers: {
            ...state.layers,
            [layerId]: {
                ...state.layers[layerId],
                visible: !state.layers[layerId].visible,
            }
        }
    })),

    fetchGeoJSONData: async () => {
        try {
            const response = await fetch(
                'https://services2.arcgis.com/w657bnjzrjguNyOy/ArcGIS/rest/services/Municipal_Boundaries_Line/FeatureServer/1/query?where=1%3D1&outFields=*&f=geojson'
            );
            const data = await response.json();
            set((state) => ({
                geojsonData: data,
                isDataLoaded: data?.features?.length > 0,
                layers: {
                    ...state.layers,
                    'st-louis-municipalities': {
                        ...state.layers['st-louis-municipalities'],
                        data: data,
                    }
                }
            }));
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
            set({geojsonData: null, isDataLoaded: false});
        }
    },
    // Filter state for GeoJSON data
    filters: {
        municipality: [],
        municode: [],
        areaMin: '',
        areaMax: '',
    },
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),
    resetFilters: () => set({
        filters: {
            municipality: [],
            municode: [],
            areaMin: '',
            areaMax: '',
        }
    }),

    // Computed getter for filtered GeoJSON data
    getFilteredGeoJSONData: () => {
        const state = get();
        const { geojsonData, filters } = state;
        
        if (!geojsonData || !geojsonData.features) return geojsonData;
        
        const filteredFeatures = geojsonData.features.filter(feature => {
            const props = feature.properties;
            
            // Filter by municipality name (array contains match)
            if (filters.municipality.length > 0 && !filters.municipality.includes(props.MUNICIPALITY)) {
                return false;
            }
            
            // Filter by municipal code (array contains match)
            if (filters.municode.length > 0 && !filters.municode.includes(props.MUNICODE)) {
                return false;
            }
            
            // Filter by area range
            const area = props.SQ_MILES;
            if (!Number.isFinite(area)) {
                return false; // Skip features with invalid area values
            }
            if (filters.areaMin && area < parseFloat(filters.areaMin)) {
                return false;
            }
            if (filters.areaMax && area > parseFloat(filters.areaMax)) {
                return false;
            }
            
            return true;
        });
        
        return {
            ...geojsonData,
            features: filteredFeatures
        };
    },

    // Get unique municipality names for dropdown options
    getUniqueMunicipalities: () => {
        const state = get();
        if (!state.geojsonData?.features) return [];
        
        const municipalities = state.geojsonData.features
            .map(feature => feature.properties.MUNICIPALITY)
            .filter(name => name && name.trim() !== '');
        
        return [...new Set(municipalities)].sort();
    },

    // Get unique municipal codes for dropdown options
    getUniqueMunicodes: () => {
        const state = get();
        if (!state.geojsonData?.features) return [];
        
        const codes = state.geojsonData.features
            .map(feature => feature.properties.MUNICODE)
            .filter(code => code && code.trim() !== '');
        
        return [...new Set(codes)].sort();
    },

    snackbar: {
        open: false,
        message: '',
        severity: 'success',
    },
    showSnackbar: (message, severity = 'success') =>
        set({
            snackbar: {open: true, message, severity},
        }),
    hideSnackbar: () =>
        set((state) => ({
            snackbar: {...state.snackbar, open: false},
        })),
}));

export default useStore;
