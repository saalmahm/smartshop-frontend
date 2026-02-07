import { useEffect, useState } from 'react';
import { productApi } from '../../api/productApi';
import ProductList from '../../components/ProductList';
import ProductFormModal from '../../components/ProductFormModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0); // pagination front simple
  const pageSize = 12;

  const [filters, setFilters] = useState({ name: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger la liste admin
  useEffect(() => {
    let isCancelled = false;

    async function fetchAdminProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getAdminProducts();
        if (isCancelled) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isCancelled) return;
        console.error('Erreur lors du chargement des produits admin', e);
        setError('Impossible de charger la liste des produits admin.');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchAdminProducts();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Pagination front sur la liste complète admin
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize) || 1);
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedProducts = products.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const handleFiltersChange = (nextFilters) => {
    setPage(0);
    setFilters(nextFilters);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const refreshProducts = async () => {
    const data = await productApi.getAdminProducts();
    setProducts(Array.isArray(data) ? data : []);
  };

  const handleSubmitProduct = async (values) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'edit' && selectedProduct) {
        await productApi.updateProduct(selectedProduct.id, values);
      } else {
        await productApi.createProduct(values);
      }
      await refreshProducts();
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await productApi.deleteProduct(product.id);
      await refreshProducts();
    } catch (e) {
      console.error('Erreur lors de la suppression du produit', e);
      window.alert(
        "Impossible de supprimer ce produit pour le moment. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  */

  return (
    <div className="p-6 md:p-8 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gestion du catalogue produits : création, modification, suppression.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white text-xs font-semibold px-4 py-2 shadow-sm hover:bg-indigo-700"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nouveau produit
        </button>
      </div>

      <ProductList
        mode="admin"
        products={paginatedProducts}
        isLoading={isLoading || isSubmitting}
        error={error}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onProductClick={handleOpenEdit}
      />

      {/* Modal création/édition */}
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialProduct={selectedProduct}
        onSubmit={handleSubmitProduct}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}