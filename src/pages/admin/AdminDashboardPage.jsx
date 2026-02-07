import { useMemo } from 'react';

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

export default function AdminDashboardPage() {
  // TODO: remplacer par de vraies données (API)
  const stats = useMemo(
    () => ({
      totalRevenue: 32450,
      monthlyRevenue: 7850,
      totalOrders: 128,
      pendingOrders: 9,
      customers: 57,
      newCustomers: 6,
      avgOrderValue: 253.5,
      conversionRate: 3.2,
    }),
    []
  );

  const recentOrders = useMemo(
    () => [
      {
        id: 812,
        clientName: 'Jean Dupont',
        createdAt: '2025-02-02T10:15:30.123456',
        totalTtc: 336,
        status: 'CONFIRMED',
      },
      {
        id: 813,
        clientName: 'Sarah Martin',
        createdAt: '2025-02-03T14:20:00.000000',
        totalTtc: 120,
        status: 'PENDING',
      },
      {
        id: 814,
        clientName: 'Entreprise ACME',
        createdAt: '2025-02-03T16:45:00.000000',
        totalTtc: 890,
        status: 'CONFIRMED',
      },
      {
        id: 815,
        clientName: 'Alex Leroy',
        createdAt: '2025-02-04T09:10:00.000000',
        totalTtc: 210,
        status: 'CANCELED',
      },
    ],
    []
  );

  const revenueSparkline = [30, 45, 50, 60, 55, 70, 90];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Vue d&#39;ensemble de l&#39;activité : chiffre d&#39;affaires,
            commandes et clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm">
              calendar_month
            </span>
            30 derniers jours
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
          >
            <span className="material-symbols-outlined text-sm">
              add_shopping_cart
            </span>
            Nouvelle commande
          </button>
        </div>
      </div>

      {/* Ligne centrale : graph simplifié + stats secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph simplifié (placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Revenus des 7 derniers jours
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Évolution journalière du chiffre d&#39;affaires
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>
              +12,4%
            </span>
          </div>

          {/* Faux sparkline */}
          <div className="mt-4 h-32 flex items-end gap-1.5">
            {revenueSparkline.map((value, idx) => (
              <div
                key={`spark-${idx}`}
                className="flex-1 rounded-full bg-violet-100 relative overflow-hidden"
                style={{ height: `${value}%` }}
              >
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-violet-600/90 to-violet-400/60" />
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
            <div>
              <p className="text-[11px] text-gray-500">Moyenne / jour</p>
              <p className="text-sm font-semibold">
                {formatCurrency((stats.monthlyRevenue / 30).toFixed(0))}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Panier moyen</p>
              <p className="text-sm font-semibold">
                {formatCurrency(stats.avgOrderValue)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Taux de conversion</p>
              <p className="text-sm font-semibold">
                {stats.conversionRate} %
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Commandes en attente</p>
              <p className="text-sm font-semibold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Stats secondaires */}
        <div className="space-y-3">
          <SecondaryCard
            icon="star"
            label="Clients fidèles (Gold/Platinum)"
            value="18"
            description="Clients avec forte récurrence d'achat"
          />
          <SecondaryCard
            icon="local_offer"
            label="Promos actives"
            value="3"
            description="Campagnes de remise en cours"
          />
          <SecondaryCard
            icon="inventory_2"
            label="Produits en rupture"
            value="5"
            description="À réapprovisionner rapidement"
            variant="warning"
          />
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Dernières commandes
            </h2>
            <p className="text-xs text-gray-500">
              Aperçu des commandes les plus récentes.
            </p>
          </div>
        </div>
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
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">
                    {order.clientName}
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
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-4 text-center text-xs text-gray-500"
                  >
                    Aucune commande récente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
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

/* Carte KPI principale */
function KpiCard({ icon, label, value, trend, trendPositive }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <span className="material-symbols-outlined text-base text-violet-500">
            {icon}
          </span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`text-[11px] mt-1 ${
              trendPositive ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

/* Cartes secondaires à droite du graph */
function SecondaryCard({ icon, label, value, description, variant }) {
  const color =
    variant === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-violet-100 text-violet-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className={`rounded-xl p-2 ${color}`}>
        <span className="material-symbols-outlined text-base">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">
          {label}
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
        <p className="text-[11px] text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}