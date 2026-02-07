import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleLogout = async () => {
    try {
      await dispatch(performLogout()).unwrap();
    } catch {
      // ignore error
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simple avec logout */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
        <div className="font-semibold">SmartShop Dashboard</div>
        <div className="flex items-center gap-4">
          {user?.username && (
            <span className="text-sm text-slate-200">
              Connecté en tant que <strong>{user.username}</strong>
              {role && ` (${role})`}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-full border border-white/40 hover:bg-white hover:text-slate-900 transition"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Contenu placeholder */}
      <main className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Contenu du dashboard à venir…
        </p>
      </main>
    </div>
  );
}

export default DashboardPage;