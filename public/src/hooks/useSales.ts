
import { useCallback } from 'react';
import { Sale } from '@/types/database';
import { useLocalStorage } from './useLocalStorage';
import { toast } from "sonner";

export function useSales() {
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      createdAt: now
    };
    
    setSales(prev => [...prev, newSale]);
    toast.success("Venda registrada com sucesso");
  }, [setSales]);

  return {
    sales,
    addSale
  };
}
