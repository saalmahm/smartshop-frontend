import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { clientApi } from '../../api/clientApi';

/* Utils */
function formatCurrency(value) {
  if (value == null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getStatusClasses(status) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'CANCELED':
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}

function getClientLabel(order, clients) {
  const client = clients.find((c) => c.id === order.clientId);
  if (client && client.name) {
    return client.name;
  }
  return `Client #${order.clientId}`;
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination front (même logique que AdminCustomersPage)
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [ordersData, clientsData] = await Promise.all([
          orderApi.getAdminOrders(),
          clientApi.getClients(),
        ]);

        if (!cancelled) {
          const list = ordersData || [];
          setOrders(list);
          setClients(clientsData || []);
          setCurrentPage(0); // reset à la première page
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Erreur lors du chargement des commandes', e);
          setError("Impossible de charger les commandes.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Stats globales (sur toutes les commandes) */
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.totalTtc || 0),
    0
  );
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING'
  ).length;
  const paidOrders = orders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'PAID'
  ).length;

  /* Pagination calculée (même pattern que clients) */
  const totalPages =
    totalOrders === 0 ? 0 : Math.ceil(totalOrders / pageSize);
  const safeCurrentPage =
    totalPages === 0 ? 0 : Math.min(Math.max(currentPage, 0), totalPages - 1);
  const startIndex = safeCurrentPage * pageSize;
  const paginatedOrders = orders.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      totalPages === 0 ? 0 : Math.min(prev + 1, totalPages - 1)
    );
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivi et gestion des commandes clients
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/orders/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nouvelle commande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon="receipt_long"
          label="Total commandes"
          value={totalOrders}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon="euro"
          label="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          icon="schedule"
          label="En attente"
          value={pendingOrders}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon="check_circle"
          label="Payées"
          value={paidOrders}
          color="bg-sky-100 text-sky-600"
        />
      </div>

      {/* Barre pagination */}
      {!isLoading && !error && totalOrders > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-600">
            {totalOrders} commande{totalOrders > 1 ? 's' : ''} au total
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={safeCurrentPage === 0}
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
                  } else if (safeCurrentPage < 2) {
                    pageIndex = i;
                  } else if (safeCurrentPage > totalPages - 3) {
                    pageIndex = totalPages - 5 + i;
                  } else {
                    pageIndex = safeCurrentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageIndex}
                      type="button"
                      onClick={() => handlePageClick(pageIndex)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        pageIndex === safeCurrentPage
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={
                totalPages === 0 || safeCurrentPage >= totalPages - 1
              }
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* États */}
      {isLoading && (
        <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-600">
          Chargement des commandes...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && totalOrders === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-500">
          Aucune commande trouvée.
        </div>
      )}

      {/* Tableau principal */}
      {!isLoading && !error && paginatedOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Commande
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Total TTC
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(order.id)}
                  >
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {getClientLabel(order, clients)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.totalTtc)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                          order.status
                        )}`}
                      >
                        {order.status}
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

/* Carte de stats */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <span className="material-symbols-outlined text-xl">
            {icon}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-lg font-semibold text-gray-900 mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}