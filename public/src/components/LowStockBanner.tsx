
import React from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const LowStockBanner: React.FC = () => {
  const { inventory, products, getProduct } = useDatabase();
  
  // Filtra os itens com estoque baixo
  const lowStockItems = inventory.filter(item => 
    item.currentQuantity < item.minQuantity
  );
  
  if (lowStockItems.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção: Estoque Baixo</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Existem {lowStockItems.length} produtos com estoque abaixo do mínimo recomendado.
        </p>
        <div className="mt-2 text-xs max-h-20 overflow-y-auto">
          {lowStockItems.slice(0, 5).map(item => {
            const product = getProduct(item.productId);
            return (
              <div key={item.id} className="flex justify-between mb-1">
                <span>{product?.name}</span>
                <span className="font-semibold">
                  {item.currentQuantity}/{item.minQuantity}
                </span>
              </div>
            );
          })}
          {lowStockItems.length > 5 && (
            <div className="text-center mt-1">
              E mais {lowStockItems.length - 5} produtos...
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
