import {Navigate, Outlet, useLocation} from "react-router-dom";

const isAuthenticated = () => !!localStorage.getItem("access_token");

export default function PrivateRouter({redirectTo = "/login"}) {
    const location = useLocation();
    // Remember where the user was going so login can send them back there
    return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace state={{ from: location.pathname }}/>;
}
