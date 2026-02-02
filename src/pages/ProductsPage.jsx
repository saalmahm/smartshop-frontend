import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import ProductList from '../components/ProductList';

function ProductsPage() {
  const [page, setPage] = useState(0);          // page 0-based pour le backend
  const [pageSize] = useState(12);              // taille de page

  // Filtres simples : uniquement name (côté backend)
  const [filters, setFilters] = useState({
    name: '',
  });

  const [products, setProducts] = useState([]); // data.content
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await productApi.getProducts({
          page,
          size: pageSize,
          filters, // envoie juste name au backend
        });

        if (isCancelled) return;

        setProducts(data.content || []);
        setTotalPages(data.totalPages ?? 0);
      } catch (e) {
        if (isCancelled) return;
        console.error('Erreur lors du chargement des produits', e);
        setError('Impossible de charger la liste des produits.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isCancelled = true;
    };
    // IMPORTANT : on ne dépend que de filters.name, pas de l'objet complet
  }, [page, pageSize, filters.name]);

  const handleFiltersChange = (nextFilters) => {
    // quand on change les filtres, on revient à la première page
    setPage(0);
    setFilters(nextFilters);
  };

  return (
    <div className="p-6 md:p-8">
      <ProductList
        mode="public"
        products={products}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}

export default ProductsPage;