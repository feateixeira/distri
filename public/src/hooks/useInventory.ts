
import { useCallback } from 'react';
import { InventoryItem } from '@/types/database';
import { useLocalStorage } from './useLocalStorage';
import { toast } from "sonner";

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);

  const getInventoryForProduct = useCallback((productId: string) => {
    return inventory.find(item => item.productId === productId);
  }, [inventory]);

  const updateInventory = useCallback((item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    setInventory(prev => {
      const existingItem = prev.find(i => i.productId === item.productId);
      if (existingItem) {
        return prev.map(i => {
          if (i.productId === item.productId) {
            return {
              ...i,
              ...item,
              updatedAt: now
            };
          }
          return i;
        });
      } else {
        return [...prev, {
          ...item, 
          id: crypto.randomUUID(),
          updatedAt: now
        }];
      }
    });
    toast.success("Estoque atualizado com sucesso");
  }, [setInventory]);

  const deleteInventoryForProduct = useCallback((productId: string) => {
    setInventory(prev => prev.filter(item => item.productId !== productId));
  }, [setInventory]);

  return {
    inventory,
    getInventoryForProduct,
    updateInventory,
    deleteInventoryForProduct
  };
}
