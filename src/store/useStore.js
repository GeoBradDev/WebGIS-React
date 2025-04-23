import {create} from 'zustand';

const useStore = create((set) => ({
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

    fetchGeoJSONData: async () => {
        try {
            const response = await fetch(
                'https://services2.arcgis.com/w657bnjzrjguNyOy/ArcGIS/rest/services/Municipal_Boundaries_Line/FeatureServer/1/query?where=1%3D1&outFields=*&f=geojson'
            );
            const data = await response.json();
            set({
                geojsonData: data,
                isDataLoaded: data?.features?.length > 0,
            });
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
            set({geojsonData: null, isDataLoaded: false});
        }
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
