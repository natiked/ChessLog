import { Outlet, Navigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const PublicRoute = () => {
    const {token} = useAuth()
    
    if (token) {
        return <Navigate to='/dashboard' replace/>
    }

    return <Outlet />
}
 