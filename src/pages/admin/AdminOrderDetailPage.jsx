import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { clientApi } from '../../api/clientApi';
import { paymentApi } from '../../api/paymentApi';

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
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // États formulaire paiement
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('ESPECES');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentBank, setPaymentBank] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setActionMessage(null);
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
          const msg =
            e?.response?.data?.message || 'Impossible de charger la commande.';
          setError(msg);
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
  const isPending = order?.status === 'PENDING';
  const remainingAmount = order?.remainingAmount || 0;
  const totalTtc = order?.totalTtc || 0;
  const totalPaid = totalTtc - remainingAmount;
  const isFullyPaid = remainingAmount === 0;

  // Badge de statut de paiement
  let paymentStatusLabel = 'Non payé';
  let paymentStatusClasses =
    'bg-red-50 text-red-700 border border-red-200';

  if (remainingAmount === 0 && totalTtc > 0) {
    paymentStatusLabel = 'Payé';
    paymentStatusClasses =
      'bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else if (remainingAmount > 0 && remainingAmount < totalTtc) {
    paymentStatusLabel = 'Partiellement payé';
    paymentStatusClasses =
      'bg-amber-50 text-amber-700 border border-amber-200';
  }

  async function handleStatusChange(type) {
    if (!order) return;
    setActionLoading(true);
    setActionMessage(null);
    setError(null);

    try {
      let updated;
      if (type === 'confirm') {
        updated = await orderApi.confirmOrder(order.id);
      } else if (type === 'cancel') {
        updated = await orderApi.cancelOrder(order.id);
      } else if (type === 'reject') {
        updated = await orderApi.rejectOrder(order.id);
      }

      setOrder(updated);
      setActionMessage('Statut de la commande mis à jour avec succès.');
    } catch (e) {
      console.error('Erreur lors du changement de statut', e);
      const msg =
        e?.response?.data?.message ||
        'Impossible de mettre à jour le statut de la commande.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreatePayment(e) {
    e.preventDefault();
    if (!order) return;

    setPaymentError(null);
    setPaymentSuccess(null);

    const amountNumber = Number(paymentAmount);
    const remaining = order.remainingAmount || 0;

    if (!paymentAmount || Number.isNaN(amountNumber)) {
      setPaymentError('Veuillez saisir un montant valide.');
      return;
    }
    if (amountNumber <= 0) {
      setPaymentError('Le montant du paiement doit être positif.');
      return;
    }
    if (remaining > 0 && amountNumber > remaining) {
      setPaymentError(
        'Le montant du paiement ne peut pas dépasser le montant restant dû.'
      );
      return;
    }

    setPaymentLoading(true);
    try {
      const payment = await paymentApi.createPayment({
        orderId: order.id,
        amount: amountNumber,
        type: paymentType,
        dueDate: null,
        reference: paymentReference || null,
        bank: paymentBank || null,
      });

      if (paymentType === 'ESPECES') {
        setPaymentSuccess(
          'Paiement encaissé et pris en compte dans le solde de la commande.'
        );
      } else {
        setPaymentSuccess(
          'Paiement enregistré (chèque / virement), en attente d’encaissement par la comptabilité. Le solde sera mis à jour après encaissement.'
        );
      }

      setPaymentAmount('');
      setPaymentReference('');
      setPaymentBank('');

      // Recharger la commande pour mettre à jour le montant restant
      const updated = await orderApi.getOrderById(order.id);
      setOrder(updated);
    } catch (e) {
      console.error('Erreur lors de la création du paiement', e);
      const msg =
        e?.response?.data?.message || "Impossible d'enregistrer le paiement.";
      setPaymentError(msg);
    } finally {
      setPaymentLoading(false);
    }
  }

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

      {/* Messages d'état/action */}
      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* États de chargement/absence */}
      {isLoading && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-600">
          Chargement de la commande...
        </div>
      )}

      {!isLoading && !error && !order && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
          Aucune donnée pour cette commande.
        </div>
      )}

      {order && (
        <>
          {/* Actions de statut (ADMIN) */}
          {isPending && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('confirm')}
                  disabled={actionLoading || !isFullyPaid}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                    isFullyPaid
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-emerald-300 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    check_circle
                  </span>
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('cancel')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-xs">
                    cancel
                  </span>
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('reject')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-xs">
                    block
                  </span>
                  Rejeter
                </button>
              </div>

              {!isFullyPaid && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    info
                  </span>
                  La commande doit être entièrement payée avant de pouvoir être
                  confirmée.
                </p>
              )}
            </div>
          )}

          {/* Résumé haut (client + montants) */}
          <div className="grid grid-cols-1 md-cols-3 md:grid-cols-3 gap-4">
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
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase">
                  Montants TTC
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${paymentStatusClasses}`}
                >
                  {paymentStatusLabel}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{formatCurrency(order.tvaAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-dashed border-gray-200 mt-1">
                  <span>Total TTC</span>
                  <span>{formatCurrency(totalTtc)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-700 mt-1">
                  <span>Montant payé</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-700 mt-1">
                  <span>Montant restant</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enregistrement d'un paiement */}
          {isPending && remainingAmount > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase">
                    Enregistrer un paiement
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Montant restant dû :{' '}
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </p>
                </div>
              </div>

              {paymentError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
                  {paymentError}
                </div>
              )}
              {paymentSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                  {paymentSuccess}
                </div>
              )}

              <form
                onSubmit={handleCreatePayment}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
              >
                {/* Montant */}
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Montant du paiement
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex : 120.00"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[11px] text-gray-400">
                      €
                    </span>
                  </div>
                </div>

                {/* Type de paiement */}
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Type de paiement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="VIREMENT">Virement</option>
                  </select>
                </div>

                {/* Référence (optionnel) */}
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Référence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex : CHQ-123456"
                  />
                </div>

                {/* Banque (optionnel) */}
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Banque (optionnel)
                  </label>
                  <input
                    type="text"
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex : BNP Paribas"
                  />
                </div>

                {/* Bouton */}
                <div className="md:col-span-4 flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">
                      payments
                    </span>
                    {paymentLoading
                      ? 'Enregistrement...'
                      : 'Enregistrer le paiement'}
                  </button>
                </div>
              </form>
            </div>
          ) : remainingAmount <= 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-2 text-xs text-gray-500">
              Cette commande est déjà entièrement payée.
              <br />
              Aucun nouveau paiement ne peut être enregistré.
            </div>
          ) : null}

          {/* Historique des paiements */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-3">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">
                Paiements de la commande
              </h2>
              <p className="text-[11px] text-gray-500">
                Total encaissé :{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalPaid)}
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Montant
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Référence
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Banque
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.payments || []).map((pmt) => (
                    <tr key={pmt.id}>
                      <td className="px-5 py-3 text-xs text-gray-700">
                        {pmt.paymentDate
                          ? formatDateTime(pmt.paymentDate)
                          : '-'}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-700">
                        {pmt.type}
                      </td>
                      <td className="px-5 py-3 text-xs text-right font-semibold text-gray-900">
                        {formatCurrency(pmt.amount)}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-gray-700">
                        {pmt.status}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-gray-600">
                        {pmt.reference || '-'}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-gray-600">
                        {pmt.bank || '-'}
                      </td>
                    </tr>
                  ))}
                  {(!order.payments || order.payments.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-4 text-center text-xs text-gray-500"
                      >
                        Aucun paiement enregistré pour cette commande.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lignes de commande */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-3">
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