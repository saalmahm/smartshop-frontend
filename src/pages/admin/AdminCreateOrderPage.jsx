import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../api/clientApi';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';

function isValidPromo(code) {
  if (!code) return true;
  const trimmed = code.trim();
  const regex = /^PROMO-[A-Z0-9]{4}$/;
  return regex.test(trimmed);
}

export default function AdminCreateOrderPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const [clientId, setClientId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1 },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null);

  // Charger clients + produits
  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [clientsData, productsData] = await Promise.all([
          clientApi.getClients(),
          productApi.getAdminProducts(),
        ]);
        if (isCancelled) return;
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (e) {
        if (isCancelled) return;
        console.error('Erreur lors du chargement des données commande', e);
        setError(
          "Impossible de charger les clients ou produits pour créer une commande."
        );
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === 'quantity'
                  ? value.replace(/[^0-9]/g, '')
                  : value,
            }
          : item
      )
    );
  };

  const validate = () => {
    const errors = {};

    if (!clientId) {
      errors.clientId = 'Le client est obligatoire.';
    }

    if (!items.length) {
      errors.items = 'La commande doit contenir au moins une ligne.';
    }

    const itemErrors = items.map((item) => {
      const e = {};
      if (!item.productId) {
        e.productId = 'Produit obligatoire.';
      }
      const qty = Number(item.quantity);
      if (!qty || qty < 1) {
        e.quantity = 'Quantité minimale : 1.';
      }
      return e;
    });

    if (itemErrors.some((e) => Object.keys(e).length > 0)) {
      errors.itemErrors = itemErrors;
    }

    if (promoCode && !isValidPromo(promoCode)) {
      errors.promoCode = 'Le code promo doit respecter le format PROMO-XXXX.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalMessage(null);

    if (!validate()) return;

    const payload = {
      clientId: Number(clientId),
      promoCode: promoCode.trim() || null,
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      setIsSubmitting(true);
      const order = await orderApi.createOrder(payload);

      if (order.status === 'REJECTED') {
        setGlobalMessage(
          "Commande créée mais rejetée pour stock insuffisant sur au moins un produit."
        );
      } else {
        setGlobalMessage('Commande créée avec succès.');
      }

      // Redirection éventuelle vers la page des commandes
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la création de la commande', err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Une erreur s'est produite lors de la création de la commande.";
      setGlobalMessage(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle commande
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Créer une commande multi-produits pour un client.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Retour aux commandes
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {globalMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-3 py-2">
          {globalMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5"
      >
        {/* Client */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Client
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              formErrors.clientId ? 'border-red-400' : 'border-slate-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Sélectionner un client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
          {formErrors.clientId && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.clientId}
            </p>
          )}
        </div>

        {/* Lignes de commande */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Lignes de commande
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700 px-3 py-1 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              Ajouter une ligne
            </button>
          </div>

          {formErrors.items && (
            <p className="mb-2 text-xs text-red-600">
              {formErrors.items}
            </p>
          )}

          <div className="space-y-3">
            {items.map((item, index) => {
              const itemErr =
                formErrors.itemErrors && formErrors.itemErrors[index]
                  ? formErrors.itemErrors[index]
                  : {};
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-3 items-end bg-slate-50 rounded-lg px-3 py-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Produit
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        itemErr.productId
                          ? 'border-red-400'
                          : 'border-slate-300'
                      }`}
                    >
                      <option value="">Sélectionner un produit...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.unitPrice} € (stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                    {itemErr.productId && (
                      <p className="mt-1 text-xs text-red-600">
                        {itemErr.productId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        itemErr.quantity
                          ? 'border-red-400'
                          : 'border-slate-300'
                      }`}
                    />
                    {itemErr.quantity && (
                      <p className="mt-1 text-xs text-red-600">
                        {itemErr.quantity}
                      </p>
                    )}
                  </div>

                  <div className="flex md:justify-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 text-xs font-medium text-red-700 px-3 py-1 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-xs">
                          delete
                        </span>
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code promo */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Code promo (optionnel)
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Ex: PROMO-AB12"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              formErrors.promoCode ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          <p className="mt-1 text-xs text-slate-500">
            Format attendu : PROMO-XXXX (4 caractères A‑Z ou 0‑9).
          </p>
          {formErrors.promoCode && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.promoCode}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Création...' : 'Créer la commande'}
          </button>
        </div>
      </form>
    </div>
  );
}