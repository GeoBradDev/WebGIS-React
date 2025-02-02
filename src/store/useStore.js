import { create } from 'zustand';

const useStore = create((set) => ({
    defaultCenter: [38.64, -90.3], // Default map center
    mapCenter: [38.64, -90.3], // Default map center
    setMapCenter: (newCenter) => set({ mapCenter: newCenter }),

   userLocation: null,
    setUserLocation: (location) => {
        set(() => ({ userLocation: location ? [...location] : null })); // Ensure a new array reference
    },

    isTableCollapsed: true,
    toggleTable: () => set((state) => ({ isTableCollapsed: !state.isTableCollapsed })),

    aboutOpen: false, // State for dialog
    openAbout: () => set({ aboutOpen: true }),
    closeAbout: () => set({ aboutOpen: false }),

    authOpen: false,
    openAuth: () => set({ authOpen: true }),
    closeAuth: () => set({ authOpen: false }),

    geojsonData: null,
    isDataLoaded: false,
    fetchGeoJSONData: async () => {
        try {
            console.log("Fetching GeoJSON data...");
            const response = await fetch(
                'https://services2.arcgis.com/w657bnjzrjguNyOy/ArcGIS/rest/services/Municipal_Boundaries_Line/FeatureServer/1/query?where=1%3D1&outFields=*&f=geojson'
            );
            const data = await response.json();
            set({
                geojsonData: data,
                isDataLoaded: data?.features?.length > 0,
            });
            console.log("GeoJSON data successfully loaded:", data);
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
            set({ geojsonData: null, isDataLoaded: false });
        }
    },
}));

export default useStore;
