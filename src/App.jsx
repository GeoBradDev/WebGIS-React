import {useState, useEffect} from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    DialogActions,
    DialogContent,
    Dialog,
    DialogTitle,
    Snackbar,
    Alert,
} from '@mui/material';
import Sidebar from '../Components/Sidebar.jsx';
import MapView from '../Components/Mapview.jsx';
import CollapsibleTable from "../Components/CollapsableTable.jsx";
import AuthForm from "../Components/AuthForm.jsx";
import ForgotPasswordForm from "../Components/ForgotPasswordForm.jsx";
import useStore from '../src/store/useStore';
import {useAuthStore} from './store/useAuthStore.js';
import Footer from "../Components/Footer.jsx";
import logo from './assets/geobradlogo.png';

function App() {
    const setMapCenter = useStore((state) => state.setMapCenter);
    const {isAuthenticated, logout} = useAuthStore();
    const setCsrfToken = useAuthStore(state => state.setCsrfToken);

    // Modal State
    const [aboutOpen, setAboutOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const {snackbar, showSnackbar, hideSnackbar} = useStore();

    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    // Trigger a snackbar message on authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            showSnackbar('You are now logged in!', 'success');
        } else {
            showSnackbar('You are now logged out!', 'info');
        }
    }, [isAuthenticated, showSnackbar]);

    useEffect(() => {
        void setCsrfToken();
    }, [setCsrfToken]);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
            {/* Navbar */}
            <AppBar position="static">
                <Toolbar>
                    <Box
                    component="img"
                    sx={{ height: 55, marginRight: 1 }}
                    alt="Logo"
                    src={logo}
                />
                    <Typography variant="h6" sx={{flexGrow: 1}}>
                        WebGIS Application Template
                    </Typography>
                    <Button color="inherit" onClick={() => window.location.reload()}>Home</Button>
                    <Button color="inherit" onClick={() => setAboutOpen(true)}>About</Button>
                    {isAuthenticated ? (
                        <Button color="inherit" onClick={logout}>Sign out</Button>
                    ) : (
                        <Button color="inherit" onClick={() => setAuthOpen(true)}>Sign in</Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{display: 'flex', flex: 1, position: 'relative'}}>
                <Sidebar setMapCenter={setMapCenter}/>
                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'}}>
                    <MapView/>
                    <CollapsibleTable/>
                </Box>
            </Box>

            {/* About Modal */}
            <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)}>
                <DialogTitle>About This Application</DialogTitle>
                <DialogContent>
                    <Typography>
                        This WebGIS application is designed to provide interactive mapping functionality for users.
                        You can explore geospatial data, interact with map layers, and use the tools provided in the
                        sidebar to customize your experience.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAboutOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Sign-In Modal */}
            <Dialog open={authOpen} onClose={() => setAuthOpen(false)}>
                <DialogTitle>Sign in</DialogTitle>
                <DialogContent>
                    <AuthForm closeAuth={() => setAuthOpen(false)}
                              openForgotPassword={() => {
                                  setAuthOpen(false);
                                  setForgotPasswordOpen(true);
                              }}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAuthOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Forgot Password Modal */}
            <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
                <DialogContent>
                    <ForgotPasswordForm onClose={() => setForgotPasswordOpen(false)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setForgotPasswordOpen(false)} color="primary">
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={hideSnackbar}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                sx={{ mb:4 }}
            >
                <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{width: '100%'}}>
                    {snackbar.message}
                </Alert>

            </Snackbar>
            {/* Footer */}
            <Footer/>
        </Box>
    );
}

export default App;
