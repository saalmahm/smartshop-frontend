import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../api/clientApi';

function formatCurrency(value) {
  if (value == null) return '-';
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} €`;
  }
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getInitials(name) {
  if (!name) return 'CL';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
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
}

function getTierClasses(tier) {
  if (tier === 'GOLD') {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  if (tier === 'SILVER') {
    return 'bg-sky-50 text-sky-700 border border-sky-200';
  }
  return 'bg-slate-50 text-slate-700 border border-slate-200';
}

export default function AdminCustomersPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // pagination front
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // filtre simple par nom / email
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function fetchClients() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await clientApi.getClients();
        if (isCancelled) return;
        setClients(data || []);
      } catch (e) {
        if (isCancelled) return;
        console.error('Erreur lors du chargement des clients', e);
        setError('Impossible de charger la liste des clients.');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchClients();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => {
      const name = c.name || '';
      const email = c.email || '';
      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / pageSize) || 1
  );
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedClients = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage]);

  // stats
  const totalClients = clients.length;
  const totalRevenue = clients.reduce(
    (sum, c) => sum + (c.totalSpent || 0),
    0
  );
  const totalOrders = clients.reduce(
    (sum, c) => sum + (c.totalOrders || 0),
    0
  );
  const premiumCount = clients.filter(
    (c) => c.tier === 'GOLD' || c.tier === 'SILVER'
  ).length;

  const handlePrev = () => {
    if (currentPage > 0) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setPage(currentPage + 1);
  };

  const handlePageClick = (pageIndex) => {
    setPage(pageIndex);
  };

  const handleRowClick = (clientId) => {
    navigate(`/admin/clients/${clientId}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestion du portefeuille clients
        </p>
      </div>

      {/* Cartes de stats (alignées avec Produits) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-orange-600 text-xl">
                groups
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
                shopping_bag
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Commandes</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-blue-600 text-xl">
                euro
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Revenu total
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {formatCurrency(totalRevenue)}
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
                {premiumCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* États globaux */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-600 shadow-sm">
          Chargement des clients...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredClients.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500 shadow-sm">
          Aucun client trouvé.
        </div>
      )}

      {/* Ligne résumé + filtre + pagination haut */}
      {!isLoading && !error && filteredClients.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
          <div>
            {filteredClients.length} client
            {filteredClients.length > 1 ? 's' : ''} au total · Page{' '}
            <span className="font-semibold">{currentPage + 1}</span> sur{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                placeholder="Rechercher par nom ou email"
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                })}
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
        </div>
      )}

      {/* Tableau principal */}
      {!isLoading && !error && paginatedClients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CLIENT
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CONTACT
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    STATUT
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    COMMANDES
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    TOTAL DÉPENSÉ
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    DERNIÈRE COMMANDE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(client.id)}
                  >
                    {/* CLIENT */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full ${getAvatarColor(
                            client.name
                          )} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID #{client.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="py-3 px-5">
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>{client.email}</p>
                        {client.phone && (
                          <p className="text-gray-500">{client.phone}</p>
                        )}
                      </div>
                    </td>

                    {/* STATUT (tier) */}
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTierClasses(
                          client.tier
                        )}`}
                      >
                        {client.tier || 'BASIC'}
                      </span>
                    </td>

                    {/* COMMANDES */}
                    <td className="py-3 px-5 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {client.totalOrders || 0}
                      </span>
                    </td>

                    {/* TOTAL DÉPENSÉ */}
                    <td className="py-3 px-5 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(client.totalSpent)}
                      </span>
                    </td>

                    {/* DERNIÈRE COMMANDE */}
                    <td className="py-3 px-5">
                      <span className="text-xs text-gray-600">
                        {client.lastOrderDate
                          ? formatDate(client.lastOrderDate)
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
  );
}