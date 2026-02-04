import { useEffect, useState } from 'react';
import { meApi } from '../api/meApi';
import LoyaltyBadge from '../components/LoyaltyBadge';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatCurrency(value) {
  if (value == null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default function MeProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await meApi.getProfile();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Erreur lors du chargement du profil', e);
          const msg =
            e?.response?.data?.message ||
            'Impossible de charger votre profil.';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Mon profil
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Informations personnelles et niveau de fidélité.
        </p>
      </div>

      {/* États */}
      {isLoading && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-600">
          Chargement de votre profil...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && !profile && (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-500">
          Aucune information de profil disponible.
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Carte principale : identité + fidélité */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-semibold text-indigo-700">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : 'U'}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID client #{profile.id}
                  </p>
                </div>

                <LoyaltyBadge tier={profile.tier} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mt-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </p>
                  <p>{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Téléphone
                    </p>
                    <p>{profile.phone}</p>
                  </div>
                )}
                {profile.address && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Adresse
                    </p>
                    <p>{profile.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte “activité client” */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Activité
            </p>
            <div className="space-y-1 text-sm text-gray-800">
              <div className="flex justify-between">
                <span>Commandes totales</span>
                <span className="font-semibold">
                  {profile.totalOrders ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total dépensé</span>
                <span className="font-semibold">
                  {formatCurrency(profile.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 pt-1 mt-1 border-t border-dashed border-gray-200">
                <span>Première commande</span>
                <span>{formatDate(profile.firstOrderDate)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Dernière commande</span>
                <span>{formatDate(profile.lastOrderDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}