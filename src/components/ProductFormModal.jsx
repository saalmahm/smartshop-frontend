import React, { useState, useEffect } from 'react';

export default function ProductFormModal({
  isOpen,
  mode = 'create', // 'create' | 'edit'
  initialProduct = null, // { id, name, description, unitPrice, stockQuantity }
  onSubmit, // async (values) => void
  onClose,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialProduct) {
      setName(initialProduct.name || '');
      setDescription(initialProduct.description || '');
      setUnitPrice(
        initialProduct.unitPrice != null ? String(initialProduct.unitPrice) : ''
      );
      setStockQuantity(
        initialProduct.stockQuantity != null
          ? String(initialProduct.stockQuantity)
          : ''
      );
    } else {
      setName('');
      setDescription('');
      setUnitPrice('');
      setStockQuantity('');
    }
    setErrors({});
    setGlobalError(null);
    setIsSubmitting(false);
  }, [isOpen, mode, initialProduct]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Le nom du produit est obligatoire.';
    }
    if (!description.trim()) {
      nextErrors.description = 'La description est obligatoire.';
    }

    const price = Number(unitPrice);
    if (!unitPrice) {
      nextErrors.unitPrice = 'Le prix unitaire est obligatoire.';
    } else if (Number.isNaN(price) || price <= 0) {
      nextErrors.unitPrice = 'Le prix unitaire doit être supérieur à 0.';
    }

    const stock = Number(stockQuantity);
    if (stockQuantity === '') {
      nextErrors.stockQuantity = 'La quantité en stock est obligatoire.';
    } else if (Number.isNaN(stock) || stock < 0) {
      nextErrors.stockQuantity = 'La quantité en stock ne peut pas être négative.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      unitPrice: Number(unitPrice),
      stockQuantity: Number(stockQuantity),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      // On essaie de récupérer un message backend
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Une erreur s'est produite lors de l'enregistrement du produit.";
      setGlobalError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'edit' ? 'Modifier le produit' : 'Nouveau produit';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
              {globalError}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom du produit
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder='Ex: "Clavier mécanique"'
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[70px] resize-y ${
                errors.description ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="Description détaillée du produit"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Prix et stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prix unitaire (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.unitPrice ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.unitPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.unitPrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stock disponible
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.stockQuantity ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.stockQuantity}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting
                ? 'Enregistrement...'
                : mode === 'edit'
                ? 'Enregistrer'
                : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}