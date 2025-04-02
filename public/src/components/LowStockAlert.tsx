
import React, { useEffect, useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const LOW_STOCK_ALERT_INTERVAL = 20 * 60 * 1000; // 20 minutos em milissegundos

export const LowStockAlert: React.FC = () => {
  const { products, inventory, getProduct } = useDatabase();
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);
  
  useEffect(() => {
    // Função para verificar itens com estoque baixo
    const checkLowStockItems = () => {
      const currentTime = Date.now();
      
      // Verifica se passaram 20 minutos desde o último alerta
      if (currentTime - lastAlertTime > LOW_STOCK_ALERT_INTERVAL) {
        // Filtra os itens com estoque baixo
        const lowStockItems = inventory.filter(item => 
          item.currentQuantity < item.minQuantity
        );
        
        // Se houver itens com estoque baixo, mostra o alerta
        if (lowStockItems.length > 0) {
          // Obtém os nomes dos produtos com estoque baixo
          const lowStockProducts = lowStockItems.map(item => {
            const product = getProduct(item.productId);
            return {
              name: product?.name || 'Produto desconhecido',
              current: item.currentQuantity,
              min: item.minQuantity
            };
          });
          
          // Prepara a mensagem de alerta
          const message = lowStockProducts.slice(0, 3).map(p => 
            `${p.name}: ${p.current}/${p.min}`
          ).join(', ');
          
          const remainingCount = lowStockProducts.length > 3 
            ? `e mais ${lowStockProducts.length - 3} itens` 
            : '';
          
          // Exibe o toast de alerta
          toast(
            "Alerta de estoque baixo",
            {
              description: `${message} ${remainingCount}`,
              duration: 10000,
              action: {
                label: "Ver estoque",
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }
          );
          
          // Atualiza o timestamp do último alerta
          setLastAlertTime(currentTime);
        }
      }
    };
    
    // Executa a verificação imediatamente ao carregar o componente
    checkLowStockItems();
    
    // Configura o intervalo para verificar periodicamente
    const intervalId = setInterval(checkLowStockItems, 60000); // Verifica a cada minuto
    
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, [inventory, lastAlertTime, getProduct]);
  
  // Esse componente não renderiza nada visualmente
  return null;
};
