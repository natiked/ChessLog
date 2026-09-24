import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css'; 
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { 
  Route, 
  Navigate, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider 
} from 'react-router-dom';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { PublicRoute } from './pages/PublicRoute.jsx';
import { ProtectedRoute } from './pages/ProtectedRoute.jsx';
import { CreateLog } from './pages/CreateLog.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path='/' element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-session" element={<CreateLog />}/>
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);