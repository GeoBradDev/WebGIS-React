// src/Components/ForgotPasswordForm.jsx
import {useState} from "react";
import {useForm} from "react-hook-form";
import {TextField, Button, Box, Typography} from "@mui/material";
import PropTypes from "prop-types";

const allAuthEndpoint = 'https://webgis-django.onrender.com/_allauth/app/v1/auth';

const ForgotPasswordForm = ({onClose}) => {
    const {register, handleSubmit, formState: {errors}} = useForm();
    const [serverMessage, setServerMessage] = useState("");

    const onSubmit = async (data) => {
        try {
            const res = await fetch(`${allAuthEndpoint}/password/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email: data.email}),
            });
            const responseData = await res.json();
            setServerMessage(responseData.message || "Check your email for reset instructions.");
        } catch {
            setServerMessage("An error occurred. Please try again.");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{width: 300}}>
            <Typography variant="h6" gutterBottom>
                Forgot Password
            </Typography>
            <TextField
                label="Email"
                fullWidth
                margin="normal"
                {...register("email", {
                    required: "Email is required",
                    pattern: {value: /^\S+@\S+$/, message: "Invalid email format"}
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
            />
            <Button type="submit" variant="contained" fullWidth sx={{mt: 2}}>
                Send Reset Link
            </Button>
            {serverMessage && (
                <Typography variant="body2" color="primary" sx={{mt: 2}}>
                    {serverMessage}
                </Typography>
            )}
            <Button fullWidth sx={{mt: 1}} onClick={onClose}>
                Close
            </Button>
        </Box>
    );
};

ForgotPasswordForm.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;