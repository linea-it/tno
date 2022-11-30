import { Navigate } from 'react-router-dom';
// import { isAuthenticated } from '../services/api/Auth';


const PrivateRoute = ({ auth: { isAuthenticated }, children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export { PrivateRoute };
