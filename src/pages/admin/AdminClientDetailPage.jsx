import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
    return new Date(value).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

// Badge fidélité (tier)
function TierBadge({ tier }) {
  if (!tier) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
        STANDARD
      </span>
    );
  }

  const upper = String(tier).toUpperCase();
  let classes = 'bg-gray-50 text-gray-700 border-gray-200';
  if (upper.includes('GOLD')) {
    classes = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (upper.includes('SILVER')) {
    classes = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (upper.includes('PREMIUM')) {
    classes = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (upper.includes('BRONZE')) {
    classes = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${classes}`}
    >
      {upper}
    </span>
  );
}

// Badge statut commande
function OrderStatusBadge({ status }) {
  const map = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELED: 'bg-gray-50 text-gray-600 border-gray-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  const labelMap = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    CANCELED: 'Annulée',
    REJECTED: 'Rejetée',
  };
  const classes = map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  const label = labelMap[status] || status || 'Inconnu';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${classes}`}
    >
      {label}
    </span>
  );
}

function AdminClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  // édition
  const [isEditing, setIsEditing] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchClient = async () => {
      setLoadingClient(true);
      setError(null);
      try {
        const data = await clientApi.getClientById(id);
        if (isMounted) {
          setClient(data);
          // Pré-remplir le formulaire quand les données arrivent
          reset({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch (e) {
        if (isMounted) {
          setError(
            "Impossible de charger le profil client. Vérifiez que l'identifiant est valide.",
          );
        }
      } finally {
        if (isMounted) setLoadingClient(false);
      }
    };

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await clientApi.getClientOrders(id);
        if (isMounted) setOrders(Array.isArray(data) ? data : []);
      } catch {
        // on peut rester silencieux ici
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchClient();
    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [id, reset]);

  const totalOrders = client?.totalOrders ?? orders.length;
  const totalSpent =
    client?.totalSpent ??
    orders.reduce((sum, o) => sum + (o.totalTtc || 0), 0);
  const firstOrderDate = client?.firstOrderDate;
  const lastOrderDate = client?.lastOrderDate;

  const initials = client?.name
    ? client.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const onSubmit = async (data) => {
    setBackendError(null);
    try {
      const updated = await clientApi.updateClient(id, data);
      setClient(updated);
      setIsEditing(false);
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        "Une erreur s'est produite lors de la mise à jour.";
      setBackendError(message);
    }
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Bouton retour */}
        <button
          type="button"
          onClick={() => navigate('/admin/customers')}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back
          </span>
          <span>Retour à la liste des clients</span>
        </button>

        {/* Header client (sobre) */}
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-gray-900">
                  {client?.name || 'Client'}
                </h1>
                <TierBadge tier={client?.tier} />
              </div>
              {client && (
                <>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-sm">
                      mail
                    </span>
                    {client.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-sm">
                      phone
                    </span>
                    {client.phone}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {client.address}
                  </p>
                </>
              )}
              {loadingClient && (
                <p className="text-xs text-gray-400 mt-1">
                  Chargement du profil...
                </p>
              )}
            </div>
          </div>

          {/* Petit encart résumé + bouton éditer */}
          <div className="flex flex-col items-start sm:items-end text-xs text-gray-600 gap-2">
            <div>
              <span className="font-semibold text-gray-900">
                #{client?.id}
              </span>{' '}
              · ID client
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {totalOrders}
              </span>{' '}
              commandes
            </div>
            <div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(totalSpent)}
              </span>{' '}
              dépensés
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing((prev) => !prev);
                setBackendError(null);
                if (client) {
                  reset({
                    name: client.name || '',
                    email: client.email || '',
                    phone: client.phone || '',
                    address: client.address || '',
                  });
                }
              }}
              className="mt-1 inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <span className="material-symbols-outlined text-sm">
                edit
              </span>
              <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
            </button>
          </div>
        </div>

        {/* Erreur globale (chargement profil) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Formulaire d’édition */}
        {isEditing && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Modifier les informations du client
            </h2>

            {backendError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {backendError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm"
            >
              <div className="space-y-1">
                <label className="font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Le nom du client est requis',
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: "L'email est requis",
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Format e-mail invalide',
                    },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="text"
                  {...register('phone', {
                    required: 'Le téléphone est requis',
                    minLength: {
                      value: 6,
                      message: 'Numéro trop court',
                    },
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  rows={2}
                  {...register('address', {
                    required: "L'adresse est requise",
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.address && (
                  <p className="text-xs text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setBackendError(null);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats plus visuelles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-xl">
                shopping_cart
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Nombre de commandes
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {totalOrders}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-xl">
                payments
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Total dépensé
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-sky-100 text-sky-600 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-xl">
                schedule
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Première commande
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatDate(firstOrderDate)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-rose-100 text-rose-600 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-xl">
                history
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Dernière commande
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatDate(lastOrderDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Historique des commandes en mode timeline */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Historique des commandes
            </h2>
            {loadingOrders && (
              <span className="text-xs text-gray-500">
                Chargement...
              </span>
            )}
          </div>

          {orders.length === 0 && !loadingOrders ? (
            <div className="p-6 text-sm text-gray-500">
              Aucune commande pour ce client.
            </div>
          ) : (
            <div className="px-5 py-4">
              <div className="relative">
                {/* Ligne verticale timeline */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                <ul className="space-y-4">
                  {orders.map((order) => (
                    <li key={order.id} className="relative pl-8">
                      {/* Point sur la timeline */}
                      <div className="absolute left-1 top-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="text-xs text-gray-400">
                              · #{order.id}
                            </span>
                          </div>
                          <div className="mt-1">
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalTtc)}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-600">
                        {order.items && order.items.length > 0
                          ? order.items
                              .map(
                                (it) =>
                                  `${it.quantity}× ${it.productName}`,
                              )
                              .join(' · ')
                          : 'Aucun article renseigné.'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminClientDetailPage;