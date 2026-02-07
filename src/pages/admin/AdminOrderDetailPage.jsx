import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { clientApi } from '../../api/clientApi';
import { paymentApi } from '../../api/paymentApi';

function formatCurrency(value) {
  if (value == null) return '-';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function getStatusClasses(status) {
  switch (status) {
    case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'PENDING': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'CANCELED':
    case 'REJECTED': return 'bg-red-50 text-red-700 border border-red-200';
    default: return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [clientName, setClientName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('ESPECES');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentBank, setPaymentBank] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [encashLoadingId, setEncashLoadingId] = useState(null);
  const [encashError, setEncashError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [orderData, clientsData, paymentsData] = await Promise.all([
        orderApi.getOrderById(id),
        clientApi.getClients(),
        paymentApi.getOrderPayments(id)
      ]);

      setOrder(orderData);
      setPayments(paymentsData || []);
      const client = (clientsData || []).find((c) => c.id === orderData.clientId);
      setClientName(client ? client.name : null);
    } catch (e) {
      setError(e?.response?.data?.message || "Impossible de charger les données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const remainingAmount = order?.remainingAmount || 0;
  const totalTtc = order?.totalTtc || 0;
  const totalPaid = totalTtc - remainingAmount;
  const isFullyPaid = remainingAmount === 0;
  const isPending = order?.status === 'PENDING';

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
      setError(e?.response?.data?.message || 'Impossible de mettre à jour le statut.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEncashPayment(paymentId) {
    setEncashError(null);
    setEncashLoadingId(paymentId);
    try {
      await paymentApi.encashPayment(paymentId);
      await fetchData();
    } catch (e) {
      setEncashError(e?.response?.data?.message || "Erreur d'encaissement.");
    } finally {
      setEncashLoadingId(null);
    }
  }

  async function handleCreatePayment(e) {
    e.preventDefault();
    setPaymentError(null);
    setPaymentSuccess(null);
    
    const amountNumber = Number(paymentAmount);
    if (!paymentAmount || amountNumber <= 0 || amountNumber > remainingAmount) {
      setPaymentError("Montant invalide.");
      return;
    }

    setPaymentLoading(true);
    try {
      await paymentApi.createPayment({
        orderId: order.id,
        amount: amountNumber,
        type: paymentType,
        reference: paymentReference || null,
        bank: paymentBank || null,
      });

      setPaymentSuccess(paymentType === 'ESPECES' ? "Encaissé." : "Enregistré, à encaisser.");
      setPaymentAmount(''); setPaymentReference(''); setPaymentBank('');
      await fetchData();
    } catch (e) {
      setPaymentError(e?.response?.data?.message || "Erreur.");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (isLoading) return <div className="p-8 text-center text-sm text-gray-600">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/admin/orders')} className="text-sm text-gray-500 hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Retour
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClasses(order.status)}`}>
          {order.status}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Commande #{order.id}</h1>

      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          {actionMessage}
        </div>
      )}

      {isPending && (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('confirm')}
              disabled={actionLoading || !isFullyPaid}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                isFullyPaid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-300 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('cancel')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-xs">cancel</span>
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('reject')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-xs">block</span>
              Rejeter
            </button>
          </div>
          {!isFullyPaid && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              La commande doit être entièrement payée avant de pouvoir être confirmée.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Client</h2>
          <p className="font-semibold text-gray-900">{clientName || `Client #${order.clientId}`}</p>
          <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Détail HT</h2>
          <div className="text-sm flex justify-between"><span>Sous-total</span> <span>{formatCurrency(order.subTotalHt)}</span></div>
          <div className="text-sm flex justify-between text-red-600"><span>Remise</span> <span>-{formatCurrency(order.discountAmount)}</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Règlement TTC</h2>
          <div className="text-sm flex justify-between font-bold"><span>Total TTC</span> <span>{formatCurrency(totalTtc)}</span></div>
          <div className="text-sm flex justify-between text-emerald-600 font-medium"><span>Déjà payé</span> <span>{formatCurrency(totalPaid)}</span></div>
          <div className="text-sm flex justify-between text-amber-600 font-bold border-t pt-1 mt-1"><span>Reste à payer</span> <span>{formatCurrency(remainingAmount)}</span></div>
        </div>
      </div>

      {isPending && remainingAmount > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">add_card</span>
            Enregistrer un nouveau paiement
          </h2>
          {paymentError && <p className="text-xs text-red-600">{paymentError}</p>}
          {paymentSuccess && <p className="text-xs text-emerald-600">{paymentSuccess}</p>}
          <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="number" step="0.01" value={paymentAmount} onChange={(e)=>setPaymentAmount(e.target.value)} placeholder="Montant (€)" className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <select value={paymentType} onChange={(e)=>setPaymentType(e.target.value)} className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="ESPECES">Espèces</option>
              <option value="CHEQUE">Chèque</option>
              <option value="VIREMENT">Virement</option>
            </select>
            <input type="text" value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)} placeholder="Référence" className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button type="submit" disabled={paymentLoading} className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50">
              {paymentLoading ? "..." : "Valider"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-sm flex items-center gap-2 bg-gray-50">
          <span className="material-symbols-outlined text-gray-400 text-base">history</span>
          Historique des paiements
        </div>
        {encashError && (
          <div className="mx-4 mt-3 bg-red-50 text-red-700 p-2 rounded text-[11px] border border-red-100">
            {encashError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Aucun paiement.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-600">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{p.type}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'ENCAISSE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'EN_ATTENTE' && (
                        <button onClick={()=>handleEncashPayment(p.id)} disabled={encashLoadingId === p.id} className="text-indigo-600 text-xs font-bold hover:underline disabled:opacity-50">
                          {encashLoadingId === p.id ? "..." : "Encaisser"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
        <div className="p-4 border-b border-gray-100 font-bold text-sm bg-gray-50">
          Lignes de commande
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-right">Qté</th>
                <th className="px-4 py-3 text-right">Unit.</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-900">{item.productName || `Produit #${item.productId}`}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
              {(!order.items || order.items.length === 0) && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 italic">Aucune ligne dans cette commande.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
