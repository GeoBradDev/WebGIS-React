// AppRoutes.jsx
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import App from "./App";
import ResetPassword from "../Components/ResetPassword";
import ResetPasswordFromKey from "../Components/ResetPasswordFromKey"
import VerifyEmailPage from "../Components/VerifyEmailPage";

function AppRoutes() {
    return (
        <Router basename="/WebGIS-React">
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/verify-email/:key" element={<VerifyEmailPage/>}/>
                <Route path="/reset-password" element={<ResetPassword/>}/>
                <Route path="/reset-password/key/:key" element={<ResetPasswordFromKey/>}/>
                <Route path="*" element={<div>404 Not Found</div>}/>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
