import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';

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

export default function MeOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await orderApi.getMyOrders();
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Erreur lors du chargement de mes commandes', e);
          const msg =
            e?.response?.data?.message ||
            'Impossible de charger vos commandes.';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRowClick = (order) => {
    navigate(`/me/orders/${order.id}`, { state: { order } });
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Historique de vos commandes, montants et statuts.
        </p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-600">
          Chargement de vos commandes...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
          Vous n'avez pas encore de commande.
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Commande
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-semibold text-gray-900">
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