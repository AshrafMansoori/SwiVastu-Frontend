import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {

    const {
        isAuthenticated,
        authChecked,
    } = useSelector((state) => state.auth);

    // Current-user API ka response aane tak wait
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-sm text-gray-500">
                    Loading...
                </div>
            </div>
        );
    }

    // Login nahi hai
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Login hai
    return children;
};

export default ProtectedRoute;