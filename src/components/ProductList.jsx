import React, { useState, useEffect } from 'react';

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

export default function ProductList({
  mode = 'public',
  products = [],
  isLoading = false,
  error = null,
  page = 0,
  totalPages = 0,
  onPageChange = () => {},
  filters = { name: '' },
  onFiltersChange = () => {},
  onProductClick = () => {},
}) {
  // État local pour l'input de recherche
  const [searchInput, setSearchInput] = useState(filters.name || '');

  // Synchroniser l'input local avec les filtres externes
  useEffect(() => {
    setSearchInput(filters.name || '');
  }, [filters.name]);

  // Debounce pour éviter trop d'appels
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.name) {
        onFiltersChange({
          ...filters,
          name: searchInput,
        });
      }
    }, 300); // Attendre 300ms après la dernière frappe

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handlePrev = () => {
    if (page > 0) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) onPageChange(page + 1);
  };

  const handlePageClick = (pageIndex) => {
    onPageChange(pageIndex);
  };

  // Stats simples sur tous les produits de la page
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, p) => sum + (p.stockQuantity || 0),
    0
  );
  const totalValue = products.reduce(
    (sum, p) => sum + (p.unitPrice || 0) * (p.stockQuantity || 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity < 10
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestion du catalogue produits
        </p>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-orange-600 text-xl">
                inventory_2
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Total produits
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-xl">
                inventory
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Stock total</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {totalStock}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-blue-600 text-xl">
                euro
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Valeur stock</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-100 rounded-lg p-2.5">
              <span className="material-symbols-outlined text-cyan-600 text-xl">
                warning
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Stock faible</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* États globaux */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-600 shadow-sm">
          Chargement des produits...
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500 shadow-sm">
          Aucun produit trouvé.
        </div>
      )}

      {/* Ligne résumé + recherche + pagination haut */}
      {!isLoading && !error && products.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
          <div>
            {products.length} produit
            {products.length > 1 ? 's' : ''} sur cette page · Page{' '}
            <span className="font-semibold">{page + 1}</span> sur{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="w-full sm:w-56">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Rechercher par nom"
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Précédent
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageIndex;
                  if (totalPages <= 5) {
                    pageIndex = i;
                  } else if (page < 3) {
                    pageIndex = i;
                  } else if (page > totalPages - 4) {
                    pageIndex = totalPages - 5 + i;
                  } else {
                    pageIndex = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageIndex}
                      type="button"
                      onClick={() => handlePageClick(pageIndex)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        pageIndex === page
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau principal */}
      {!isLoading && !error && products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    PRODUIT
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    DESCRIPTION
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    PRIX
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    STOCK
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    VALEUR STOCK
                  </th>
                  {mode === 'admin' && (
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    {/* PRODUIT (nom seul) */}
                    <td className="py-3 px-5">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                        {product.name}
                      </p>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="py-3 px-5">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-xs">
                        {product.description || '-'}
                      </p>
                    </td>

                    {/* PRIX */}
                    <td className="py-3 px-5 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.unitPrice)}
                      </span>
                    </td>

                    {/* STOCK */}
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          product.stockQuantity === 0
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : product.stockQuantity < 10
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {product.stockQuantity === 0
                          ? 'Rupture'
                          : product.stockQuantity < 10
                          ? `${product.stockQuantity} · Faible`
                          : `${product.stockQuantity} · Dispo`}
                      </span>
                    </td>

                    {/* VALEUR STOCK */}
                    <td className="py-3 px-5 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          (product.unitPrice || 0) *
                            (product.stockQuantity || 0)
                        )}
                      </span>
                    </td>

                    {/* ACTIONS ADMIN */}
                    {mode === 'admin' && (
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // action admin plus tard
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                          Gérer
                        </button>
                      </td>
                    )}
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