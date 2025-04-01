
import React, { createContext, useContext, useCallback } from 'react';
import { DatabaseContextType } from '@/types/database';
import { useProducts } from '@/hooks/useProducts';
import { useInventory } from '@/hooks/useInventory';
import { useSales } from '@/hooks/useSales';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    products, 
    getProduct, 
    getProductByBarcode, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts();
  
  const { 
    inventory, 
    getInventoryForProduct, 
    updateInventory, 
    deleteInventoryForProduct 
  } = useInventory();
  
  const { sales, addSale } = useSales();

  // Sobrescreve o método deleteProduct para também excluir o inventário
  const handleDeleteProduct = useCallback((id: string) => {
    deleteProduct(id);
    deleteInventoryForProduct(id);
  }, [deleteProduct, deleteInventoryForProduct]);

  // Sobrescreve o método addSale para atualizar o inventário
  const handleAddSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    // Atualiza o inventário com base na venda
    const now = new Date().toISOString();
    
    sale.items.forEach(item => {
      const inventoryItem = getInventoryForProduct(item.productId);
      if (inventoryItem) {
        updateInventory({
          productId: item.productId,
          currentQuantity: inventoryItem.currentQuantity - item.quantity,
          minQuantity: inventoryItem.minQuantity,
          maxQuantity: inventoryItem.maxQuantity
        });
      }
    });
    
    // Registra a venda
    addSale(sale);
  }, [getInventoryForProduct, updateInventory, addSale]);

  const value = {
    products,
    inventory,
    sales,
    addProduct,
    updateProduct,
    deleteProduct: handleDeleteProduct,
    updateInventory,
    addSale: handleAddSale,
    getProduct,
    getProductByBarcode,
    getInventoryForProduct
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Re-exportar os tipos para manter a compatibilidade
export type { Product, InventoryItem, Sale } from '@/types/database';
