// src/layouts/AppLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { performLogout } from '../store/authSlice';

function AppLayout() {
  const { user, role } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = role === 'ADMIN';
  const isClient = role === 'CLIENT';

  const handleLogout = async () => {
    try {
      await dispatch(performLogout()).unwrap();
    } catch (e) {
      // on ignore l'erreur backend pour l'instant
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo + user */}
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="text-lg font-semibold">SmartShop</div>
          {user?.username && (
            <div className="mt-1 text-xs text-slate-300">
              {user.username} {role && `(${role})`}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
          {isClient && (
            <>
              <div className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 px-3">
                Espace client
              </div>
              <NavLink
                to="/me/profile"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Mon profil
              </NavLink>
              <NavLink
                to="/me/orders"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Mes commandes
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/customers"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Clients
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Produits 
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Commandes
              </NavLink>
              <NavLink
                to="/admin/payments"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
                  }`
                }
              >
                Paiements
              </NavLink>
            </>
          )}
        </nav>

        {/* Zone bas de sidebar : logout */}
        {(isAdmin || isClient) && (
          <div className="px-4 py-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-full border border-slate-500 text-slate-100 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <span className="material-symbols-outlined text-sm">
                logout
              </span>
              <span>Se déconnecter</span>
            </button>
          </div>
        )}
      </aside>

      {/* Contenu */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;