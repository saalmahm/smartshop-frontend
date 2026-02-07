import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';

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

export default function MeOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialOrder = location.state?.order || null;

  const [order, setOrder] = useState(initialOrder);
  const [isLoading, setIsLoading] = useState(!initialOrder);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialOrder) return;

    let cancelled = false;

    async function fetchOrder() {
      setIsLoading(true);
      setError(null);
      try {
        const all = await orderApi.getMyOrders();
        if (!cancelled) {
          const found = (all || []).find((o) => String(o.id) === String(id));
          if (!found) {
            setError('Commande introuvable.');
          } else {
            setOrder(found);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Erreur lors du chargement de la commande client', e);
          const msg =
            e?.response?.data?.message ||
            'Impossible de charger cette commande.';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      fetchOrder();
    }

    return () => {
      cancelled = true;
    };
  }, [id, initialOrder]);

  const handleBack = () => {
    navigate('/me/orders');
  };

  const items = order?.items || [];
  const hasDiscount = (order?.discountAmount || 0) > 0;

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
            Retour à mes commandes
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Commande #{order?.id || id}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Détails de votre commande et remises appliquées.
          </p>
        </div>
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
          {/* Résumé + montants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Infos commande */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Commande
              </h2>
              <p className="text-sm font-semibold text-gray-900">
                Commande #{order.id}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Passée le {formatDateTime(order.createdAt)}
              </p>
              {order.promoCode && (
                <p className="mt-2 text-xs text-indigo-700 bg-indigo-50 inline-flex px-2 py-1 rounded-full border border-indigo-100">
                  Code promo utilisé : {order.promoCode}
                </p>
              )}
            </div>

            {/* Montants HT */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Montants HT
              </h2>
              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(order.subTotalHt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remises totales</span>
                  <span>
                    {hasDiscount
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

            {/* Montants TTC */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
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

          {/* Section remises expliquée */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Remises appliquées
            </h2>
            {!hasDiscount ? (
              <p className="text-xs text-gray-500">
                Aucune remise n'a été appliquée sur cette commande.
              </p>
            ) : (
              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Remise totale sur la commande</span>
                  <span className="font-semibold">
                    - {formatCurrency(order.discountAmount)}
                  </span>
                </div>

                {order.promoCode && (
                  <p className="text-xs text-gray-600">
                    Une partie de cette remise provient du code promo{' '}
                    <span className="font-semibold">
                      {order.promoCode}
                    </span>
                    .
                  </p>
                )}

                <p className="text-xs text-gray-600">
                  Le montant de remise indiqué correspond à l'ensemble
                  des avantages appliqués sur cette commande (fidélité et/ou
                  promotion). Le détail exact entre fidélité et promotion
                  n'est pas différencié par le système, mais la somme
                  totale est {formatCurrency(order.discountAmount)}.
                </p>
              </div>
            )}
          </div>

          {/* Lignes de commande */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Articles de la commande
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
                        Aucun article trouvé pour cette commande.
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