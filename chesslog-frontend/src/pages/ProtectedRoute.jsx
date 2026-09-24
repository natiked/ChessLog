import { Outlet, Navigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = () => {
    const {token} = useAuth()
    
    if (!token) {
        return <Navigate to='/login' replace />
    }
    
    return <Outlet />
}
 