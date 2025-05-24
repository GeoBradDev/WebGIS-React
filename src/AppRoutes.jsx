// AppRoutes.jsx
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import App from "./App";
import ResetPasswordFromKey from "../Components/ResetPasswordFromKey"
import VerifyEmailPage from "../Components/VerifyEmailPage";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/verify-email/:key" element={<VerifyEmailPage/>}/>
                <Route path="/reset-password/key/:key" element={<ResetPasswordFromKey/>}/>
                <Route path="*" element={<div>404 Not Found</div>}/>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
