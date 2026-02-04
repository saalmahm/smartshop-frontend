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
    <div className="h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col h-screen sticky top-0">
        {/* Carte interne arrondie */}
        <div className="flex-1 flex flex-col px-3 py-4">
          <div className="bg-slate-900/95 rounded-3xl shadow-lg shadow-slate-900/40 flex-1 flex flex-col overflow-hidden">
            {/* Header logo + profil */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-800/80">
              {user && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold">
                    {user.username
                      ? user.username.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">
                      {user.username || 'Utilisateur'}
                    </span>
                    {role && (
                      <span className="text-[11px] text-slate-400">
                        {role === 'ADMIN' ? 'Admin' : 'Client'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 text-sm overflow-y-auto custom-scrollbar">
              {isClient && (
                <>
                  <div className="mt-1 mb-1 text-[10px] uppercase tracking-[0.12em] text-slate-500 px-3">
                    Espace client
                  </div>

                  <SidebarLink
                    to="/me/profile"
                    icon="person"
                    label="Mon profil"
                  />

                  <SidebarLink
                    to="/me/orders"
                    icon="receipt_long"
                    label="Mes commandes"
                  />
                </>
              )}

              {isAdmin && (
                <>
                  <div className="mt-1 mb-1 text-[10px] uppercase tracking-[0.12em] text-slate-500 px-3">
                    Espace admin
                  </div>

                  <SidebarLink
                    to="/admin/dashboard"
                    icon="dashboard"
                    label="Dashboard"
                  />

                  <SidebarLink
                    to="/admin/customers"
                    icon="group"
                    label="Clients"
                  />

                  <SidebarLink
                    to="/admin/products"
                    icon="inventory_2"
                    label="Produits"
                  />

                  <SidebarLink
                    to="/admin/orders"
                    icon="shopping_bag"
                    label="Commandes"
                  />

                  <SidebarLink
                    to="/admin/payments"
                    icon="payments"
                    label="Paiements"
                  />
                </>
              )}
            </nav>

            {/* Footer : logout / mode sombre */}
            {(isAdmin || isClient) && (
              <div className="px-4 py-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between text-[11px] font-medium px-3 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      logout
                    </span>
                    <span>Se déconnecter</span>
                  </span>
                  <span className="material-symbols-outlined text-xs text-slate-400">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

/* Lien de sidebar avec icône + highlight violet */
function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer relative',
          isActive
            ? 'bg-violet-600 text-white shadow-[0_0_0_1px_rgba(129,140,248,0.5)]'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {/* petite barre violette droite comme dans ton exemple */}
          {isActive && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-violet-300 rounded-l-full" />
          )}

          <span
            className={
              'material-symbols-outlined text-base ' +
              (isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100')
            }
          >
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default AppLayout;