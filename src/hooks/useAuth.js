import { useSelector } from 'react-redux';

export function useAuth() {
  const auth = useSelector((state) => state.auth);
  return auth; // { isAuthenticated, user, role, status, error }
}