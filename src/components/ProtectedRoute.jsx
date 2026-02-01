import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, role, status } = useAuth();

  // Pendant la récupération de session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Chargement de la session...</p>
      </div>
    );
  }

  // Pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rôle requis (ADMIN / CLIENT) non respecté
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // OK → rendre les routes enfants
  return <Outlet />;
}