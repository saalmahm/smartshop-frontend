import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../api/clientApi';

const PAGE_SIZE = 10;

function AdminCustomersPage() {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const totalPages = Math.max(
    1,
    Math.ceil(clients.length / PAGE_SIZE),
  );

  const visibleClients = clients.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  // Stats simples
  const totalClients = clients.length;
  const totalRevenue = clients.reduce(
    (sum, c) => sum + (c.totalSpent || 0),
    0,
  );
  const totalOrders = clients.reduce(
    (sum, c) => sum + (c.totalOrders || 0),
    0,
  );
  const activeClients = clients.filter(
    (c) => c.tier === 'Gold' || c.tier === 'Premium',
  ).length;

  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clientApi.getClients();
        if (isMounted) {
          setClients(Array.isArray(data) ? data : []);
          setCurrentPage(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            'Impossible de charger la liste des clients. Veuillez réessayer.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages - 1),
    );
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  // Initiales de l’avatar
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Couleurs d’avatar
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Badge de statut (tier) coloré
  const getStatusBadgeClasses = (tier) => {
    const map = {
      Gold: 'bg-amber-50 text-amber-700 border-amber-200',
      GOLD: 'bg-amber-50 text-amber-700 border-amber-200',
      Premium: 'bg-purple-50 text-purple-700 border-purple-200',
      PREMIUM: 'bg-purple-50 text-purple-700 border-purple-200',
      Silver: 'bg-sky-50 text-sky-700 border-sky-200',
      SILVER: 'bg-sky-50 text-sky-700 border-sky-200',
      Bronze: 'bg-orange-50 text-orange-700 border-orange-200',
      BRONZE: 'bg-orange-50 text-orange-700 border-orange-200',
      Basic: 'bg-gray-50 text-gray-700 border-gray-200',
      BASIC: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return (
      map[tier] ||
      'bg-gray-50 text-gray-700 border-gray-200'
    );
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Clients
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gestion du portefeuille clients
          </p>
        </div>

        {/* Cartes de stats (compactes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg p-2.5">
                <span className="material-symbols-outlined text-orange-600 text-xl">
                  group
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Total clients
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 rounded-lg p-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                  account_balance_wallet
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Revenu total
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {totalRevenue.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2.5">
                <span className="material-symbols-outlined text-blue-600 text-xl">
                  shopping_cart
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Commandes
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 rounded-lg p-2.5">
                <span className="material-symbols-outlined text-cyan-600 text-xl">
                  trending_up
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Clients premium
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {activeClients}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* États globaux */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-600 shadow-sm">
            Chargement des clients...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500 shadow-sm">
            Aucun client trouvé.
          </div>
        )}

        {/* Pagination + résumé, AVANT le tableau, toujours visible */}
        {!loading && !error && clients.length > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div>
              {totalClients} client
              {totalClients > 1 ? 's' : ''} au total · Page{' '}
              <span className="font-semibold">
                {currentPage + 1}
              </span>{' '}
              sur{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Précédent
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => {
                    let pageIndex;
                    if (totalPages <= 5) {
                      pageIndex = i;
                    } else if (currentPage < 3) {
                      pageIndex = i;
                    } else if (currentPage > totalPages - 4) {
                      pageIndex = totalPages - 5 + i;
                    } else {
                      pageIndex = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageIndex}
                        type="button"
                        onClick={() => handlePageClick(pageIndex)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          pageIndex === currentPage
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  },
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Tableau compact */}
        {!loading && !error && clients.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Client
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Statut
                    </th>
                    <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Commandes
                    </th>
                    <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total dépensé
                    </th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Dernière commande
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/clients/${client.id}`)
                      }
                    >
                      {/* Client + avatar */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full ${getAvatarColor(
                              client.name,
                            )} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
                          >
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                              {client.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-5">
                        <div className="text-xs">
                          <p className="text-gray-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-gray-400 text-sm">
                              mail
                            </span>
                            {client.email}
                          </p>
                          <p className="text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-gray-400 text-sm">
                              phone
                            </span>
                            {client.phone}
                          </p>
                        </div>
                      </td>

                      {/* Statut (tier) */}
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClasses(
                            client.tier,
                          )}`}
                        >
                          {client.tier || 'Standard'}
                        </span>
                      </td>

                      {/* Commandes */}
                      <td className="py-3 px-5 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {client.totalOrders ?? 0}
                        </span>
                      </td>

                      {/* Total dépensé */}
                      <td className="py-3 px-5 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {client.totalSpent != null
                            ? `${
                                client.totalSpent.toFixed
                                  ? client.totalSpent.toFixed(2)
                                  : client.totalSpent
                              } €`
                            : '-'}
                        </span>
                      </td>

                      {/* Dernière commande */}
                      <td className="py-3 px-5">
                        <span className="text-sm text-gray-600">
                          {client.lastOrderDate
                            ? new Date(
                                client.lastOrderDate,
                              ).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomersPage;