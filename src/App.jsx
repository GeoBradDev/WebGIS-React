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
    Snackbar,
    Alert, Switch, Divider, DialogTitle,
} from '@mui/material';
import Sidebar from '../Components/Sidebar.jsx';
import MapView from '../Components/Mapview.jsx';
import CollapsibleTable from "../Components/CollapsableTable.jsx";
import AuthForm from "../Components/AuthForm.jsx";
import ForgotPasswordForm from "../Components/ForgotPasswordForm.jsx";
import Dashboard from '../Components/Dashboard.jsx';
import useStore from '../src/store/useStore';
import {useAuthStore} from './store/useAuthStore.js';
import Footer from "../Components/Footer.jsx";
import logo from './assets/geobradlogo.png';
import {SNACKBAR_MESSAGES, SNACKBAR_SEVERITIES} from '../constants/snackbarMessages';
import ReusableModal from "../Components/ReusableModal.jsx";
import TermsModal from "../Components/TermsModal.jsx";
import PrivacyModal from "../Components/PrivacyModal.jsx";
import VerifyEmail from "../Components/VerifyEmailPage.jsx";

function App() {
    // Map and Dashboard state
    const setMapCenter = useStore((state) => state.setMapCenter);
    const currentView = useStore((state) => state.currentView);
    const toggleView = useStore((state) => state.toggleView);

    // User Auth State
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);
    const setCsrfToken = useAuthStore(state => state.setCsrfToken);
    const {login, register, authStage, setAuthStage} = useAuthStore();

    // Modals State
    const [aboutOpen, setAboutOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const {snackbar, showSnackbar, hideSnackbar} = useStore();
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);

    const geojsonData = useStore((state) => state.geojsonData);

    useEffect(() => {
        void setCsrfToken();
    }, [setCsrfToken]);

    const handleLogin = async (email, password) => {
        if (!login) {
            console.error("login function is not defined in useAuthStore");
            return;
        }

        const response = await login(email, password); // ✅ Use the full response object

        if (response.success) {  // ✅ Now properly checking the `success` property
            showSnackbar(SNACKBAR_MESSAGES.LOGIN_SUCCESS, SNACKBAR_SEVERITIES.SUCCESS);
            setAuthOpen(false);
        } else {
            showSnackbar(response.errors[0].message || SNACKBAR_MESSAGES.LOGIN_FAILURE, SNACKBAR_SEVERITIES.ERROR);
        }
    };


    const handleLogout = async () => {

        const response = await logout();

        if (response.success) {
            showSnackbar(SNACKBAR_MESSAGES.LOGOUT_SUCCESS, SNACKBAR_SEVERITIES.INFO);
        } else {
            showSnackbar(SNACKBAR_MESSAGES.LOGOUT_FAILURE, SNACKBAR_SEVERITIES.ERROR);
        }
    };

    const handleRegister = async (userData) => {
        if (!register) {
            console.error("register function is not defined in useAuthStore");
            return;
        }

        const response = await register(userData);

        if (response.verification_pending) {
            showSnackbar(response.message, SNACKBAR_SEVERITIES.INFO);
            setAuthStage("verify-email");
            setTimeout(() => {
                setAuthOpen(false);
            }, 2000);
        } else if (response.errors && response.errors.length > 0) {
            showSnackbar(`Registration Failed: ${response.errors[0].message}`, SNACKBAR_SEVERITIES.ERROR);
        } else {
            showSnackbar(SNACKBAR_MESSAGES.REGISTER_FAILURE, SNACKBAR_SEVERITIES.ERROR);
        }
    };
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
            {/* Navbar */}
            <AppBar position="static">
                <Toolbar>
                    <Box
                        component="img"
                        sx={{height: 55, marginRight: 1}}
                        alt="Logo"
                        src={logo}
                    />
                    <Typography variant="h6" sx={{flexGrow: 1}}>
                        WebGIS Application Template
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{mx: 2}}>
                        <Typography
                            sx={{color: currentView === 'dashboard' ? 'white' : 'grey.500', mr: 1}}
                        >
                            Dashboard
                        </Typography>
                        <Switch
                            checked={currentView === 'dashboard'}
                            onChange={toggleView}
                            color="default"
                        />
                        <Typography
                            sx={{color: currentView === 'map' ? 'white' : 'grey.500', ml: 1}}
                        >
                            Map
                        </Typography>
                    </Box>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 2,
                            height: '40px',
                            borderRightWidth: 2,
                            borderColor: 'white',
                            alignSelf: 'center',
                        }}
                    />

                    <Button color="inherit" onClick={() => window.location.reload()}>Home</Button>
                    <Button color="inherit" onClick={() => setAboutOpen(true)}>About</Button>
                    {isAuthenticated ? (
                        <Button color="inherit" onClick={handleLogout}>Sign out</Button>
                    ) : (
                        <Button color="inherit" onClick={() => setAuthOpen(true)}>Sign in</Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{display: 'flex', flex: 1, position: 'relative', overflow: 'hidden'}}>
                <Sidebar setMapCenter={setMapCenter}/>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'auto'
                }}>
                    {currentView === 'map' && (
                        <>
                            <MapView/>
                            <CollapsibleTable/>
                        </>
                    )}
                    {currentView === 'dashboard' && (
                        <Dashboard data={geojsonData.features.map(f => f.properties)}/>
                    )}
                </Box>
            </Box>

            {/* About Modal */}
            <ReusableModal
                open={aboutOpen}
                onClose={() => setAboutOpen(false)}
                title="About This Application"
            >
                <Typography>
                    This WebGIS application is designed to provide interactive mapping functionality for users.
                    You can explore geospatial data, interact with map layers, and use the tools provided in the
                    sidebar to customize your experience.
                </Typography>
            </ReusableModal>

            {/* Sign-In Modal */}
            <Dialog open={authOpen} onClose={() => setAuthOpen(false)}>
                <DialogTitle>
                    {authStage === 'register' ? 'Register' : 'Sign in'}
                </DialogTitle>
                <DialogContent>
                    <AuthForm
                        closeAuth={() => setAuthOpen(false)}
                        openForgotPassword={() => {
                            setAuthOpen(false);
                            setForgotPasswordOpen(true);
                        }}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                    />
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
                sx={{mb: 4}}
            >
                <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{width: '100%'}}>
                    {snackbar.message}
                </Alert>

            </Snackbar>
            {/* Footer */}
            <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)}/>
            <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)}/>

            <Footer setTermsOpen={setTermsOpen} setPrivacyOpen={setPrivacyOpen}/>
        </Box>
    );
}

export default App;
