// ResetPasswordFromKey.jsx
import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Box, Button, TextField, Typography, CircularProgress} from '@mui/material';
import {useAuthStore} from '../src/store/useAuthStore.js';

const ResetPasswordFromKey = () => {
    const {key} = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // This function should be implemented in your auth store to make the API call
    const resetPasswordFromKey = useAuthStore((state) => state.resetPasswordFromKey);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await resetPasswordFromKey(key, newPassword);
            if (response.success) {
                setSuccess('Your password has been reset successfully!');
                // Optionally redirect to the login page after a short delay
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.error || 'Failed to reset password.');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
        setLoading(false);
    };

    return (
        <Box sx={{maxWidth: 400, margin: 'auto', padding: 2}}>
            <Typography variant="h5" align="center" gutterBottom>
                Reset Password
            </Typography>
            {loading ? (
                <Box sx={{textAlign: 'center'}}>
                    <CircularProgress/>
                    <Typography>Resetting your password...</Typography>
                </Box>
            ) : success ? (
                <Typography variant="h6" color="success.main" align="center">
                    {success}
                </Typography>
            ) : (
                <form onSubmit={handleSubmit}>
                    <TextField
                        type="password"
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <TextField
                        type="password"
                        label="Confirm New Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <Typography variant="body2" color="error" align="center">
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt: 2}}>
                        Reset Password
                    </Button>
                </form>
            )}
        </Box>
    );
};

export default ResetPasswordFromKey;
