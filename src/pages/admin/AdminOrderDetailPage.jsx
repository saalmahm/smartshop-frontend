import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { clientApi } from '../../api/clientApi';

function formatCurrency(value) {
  if (value == null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [orderData, clientsData] = await Promise.all([
          orderApi.getOrderById(id),
          clientApi.getClients(),
        ]);

        if (!cancelled) {
          setOrder(orderData);
          const client = (clientsData || []).find(
            (c) => c.id === orderData.clientId
          );
          setClientName(client ? client.name : null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Erreur lors du chargement de la commande', e);
          setError("Impossible de charger la commande.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate('/admin/orders');
  };

  const items = order?.items || [];

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Retour aux commandes
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Commande #{order?.id || id}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Détails complets de la commande client
          </p>
        </div>

        {order && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
              order.status
            )}`}
          >
            {order.status}
          </span>
        )}
      </div>

      {/* États */}
      {isLoading && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-600">
          Chargement de la commande...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && !order && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
          Aucune donnée pour cette commande.
        </div>
      )}

      {order && (
        <>
          {/* Résumé haut (client + montants) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Client
              </h2>
              <p className="text-sm font-semibold text-gray-900">
                {clientName ? clientName : `Client #${order.clientId}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Créée le {formatDateTime(order.createdAt)}
              </p>
              {order.promoCode && (
                <p className="mt-2 text-xs text-indigo-700 bg-indigo-50 inline-flex px-2 py-1 rounded-full border border-indigo-100">
                  Code promo : {order.promoCode}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Montants HT
              </h2>
              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Sous‑total HT</span>
                  <span>{formatCurrency(order.subTotalHt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remise</span>
                  <span>
                    {order.discountAmount
                      ? `- ${formatCurrency(order.discountAmount)}`
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-dashed border-gray-200 mt-1">
                  <span>Total HT après remise</span>
                  <span>{formatCurrency(order.totalHtAfterDiscount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Montants TTC
              </h2>
              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{formatCurrency(order.tvaAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-dashed border-gray-200 mt-1">
                  <span>Total TTC</span>
                  <span>{formatCurrency(order.totalTtc)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Montant restant</span>
                  <span>{formatCurrency(order.remainingAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lignes de commande */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Lignes de commande
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Quantité
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Prix unitaire
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Total ligne
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-5 py-3 text-sm text-gray-800">
                        {item.productName || `Produit #${item.productId}`}
                      </td>
                      <td className="px-5 py-3 text-sm text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-4 text-center text-xs text-gray-500"
                      >
                        Aucune ligne dans cette commande.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}