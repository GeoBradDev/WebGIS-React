import { Box, Typography, Link, IconButton } from '@mui/material';
import {Facebook, LinkedIn, Instagram} from '@mui/icons-material';
import PropTypes from "prop-types";

const Footer = ({ setTermsOpen, setPrivacyOpen }) => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                py: 1,  // Compact height
                px: 3,  // Added padding to avoid content touching screen edges
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between', // Forces left and right alignment
                    alignItems: 'center',
                    maxWidth: '100%',
                }}
            >
                {/* Left-aligned Copyright */}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    © {new Date().getFullYear()} WebGIS Application
                </Typography>

                {/* Center-aligned Social Icons */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <IconButton href="https://instagram.com" color="inherit" target="_blank" size="small">
                        <Instagram fontSize="small" />
                    </IconButton>
                    <IconButton href="https://facebook.com" color="inherit" target="_blank" size="small">
                        <Facebook fontSize="small" />
                    </IconButton>
                    <IconButton href="https://linkedin.com" color="inherit" target="_blank" size="small">
                        <LinkedIn fontSize="small" />
                    </IconButton>
                </Box>

                {/* Right-aligned Links */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link href="#" onClick={() => setTermsOpen(true)} color="inherit" underline="hover" sx={{ fontSize: 14 }}>
                        Terms of Service
                    </Link>
                    <Link href="#" onClick={() => setPrivacyOpen(true)} color="inherit" underline="hover" sx={{ fontSize: 14 }}>
                        Privacy Policy
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

Footer.propTypes = {
  setTermsOpen: PropTypes.func.isRequired,
  setPrivacyOpen: PropTypes.func.isRequired,
};

export default Footer;
