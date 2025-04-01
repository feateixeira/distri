
import { useCallback } from 'react';
import { Product } from '@/types/database';
import { useLocalStorage } from './useLocalStorage';
import { toast } from "sonner";

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);

  const getProduct = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductByBarcode = useCallback((barcode: string) => {
    return products.find(product => product.barcode === barcode);
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    setProducts(prev => [...prev, newProduct]);
    toast.success("Produto adicionado com sucesso");
  }, [setProducts]);

  const updateProduct = useCallback((id: string, update: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return {
          ...product,
          ...update,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    }));
    toast.success("Produto atualizado com sucesso");
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success("Produto excluído com sucesso");
  }, [setProducts]);

  return {
    products,
    getProduct,
    getProductByBarcode,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
