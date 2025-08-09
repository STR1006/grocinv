import { useEffect, useState } from 'react';
import { getGlobalProductDatabase, Product } from '../services/githubDatabase';

export const useDatabaseSearch = (searchQuery: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const database = await getGlobalProductDatabase();
        const allProducts = Object.values(database);
        
        const filteredProducts = allProducts.filter(
          (product) =>
            !searchQuery ||
            product.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            product.databaseId
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error loading database products:', err);
        setError('Failed to load products from online database');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery]);

  return { products, isLoading, error };
};
