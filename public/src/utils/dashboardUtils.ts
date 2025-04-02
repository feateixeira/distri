
import { Sale, Product, InventoryItem } from "@/types/database";
import { parseISO, subDays, isSameDay, isAfter } from 'date-fns';

export interface DashboardMetrics {
  revenue: number;
  revenueChange: number;
  profit: number;
  transactions: number;
  transactionChange: number;
  lowStock: number;
}

export const calculateDashboardMetrics = (
  sales: Sale[], 
  products: Product[], 
  inventory: InventoryItem[]
): DashboardMetrics => {
  const today = new Date();
  const lastWeekStart = subDays(today, 7);
  const previousWeekStart = subDays(today, 14);

  // Filter sales for current and previous week
  const thisWeekSales = sales.filter(sale => 
    isAfter(parseISO(sale.createdAt), lastWeekStart)
  );
  
  const previousWeekSales = sales.filter(sale => 
    isAfter(parseISO(sale.createdAt), previousWeekStart) && 
    !isAfter(parseISO(sale.createdAt), lastWeekStart)
  );

  // Calculate revenue
  const thisWeekRevenue = thisWeekSales.reduce((sum, sale) => sum + sale.total, 0);
  const prevWeekRevenue = previousWeekSales.reduce((sum, sale) => sum + sale.total, 0);
  const revenueChange = prevWeekRevenue ? 
    ((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 : 100;

  // Calculate cost for this week's sales
  let thisWeekCost = 0;
  thisWeekSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        thisWeekCost += product.purchasePrice * item.quantity;
      }
    });
  });

  // Calculate profit
  const thisWeekProfit = thisWeekRevenue - thisWeekCost;

  // Count transactions
  const transactionCount = thisWeekSales.length;
  const prevWeekTransactionCount = previousWeekSales.length;
  const transactionChange = prevWeekTransactionCount ? 
    ((transactionCount - prevWeekTransactionCount) / prevWeekTransactionCount) * 100 : 100;

  // Products below minimum quantity
  const lowStockProducts = inventory.filter(item => {
    return item.currentQuantity < item.minQuantity;
  }).length;

  return {
    revenue: thisWeekRevenue,
    revenueChange,
    profit: thisWeekProfit,
    transactions: transactionCount,
    transactionChange,
    lowStock: lowStockProducts
  };
};

export interface DailySalesData {
  day: string;
  sales: number;
  revenue: number;
}

export const prepareDailySalesData = (sales: Sale[]): DailySalesData[] => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      day: format(date, 'dd/MM'),
      date: date,
      sales: 0,
      revenue: 0
    };
  });

  sales.forEach(sale => {
    const saleDate = parseISO(sale.createdAt);
    const dayIndex = days.findIndex(d => isSameDay(d.date, saleDate));
    
    if (dayIndex !== -1) {
      days[dayIndex].sales += 1;
      days[dayIndex].revenue += sale.total;
    }
  });

  return days.map(({ day, sales, revenue }) => ({ day, sales, revenue }));
};

export interface TopProduct {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export const calculateTopProducts = (sales: Sale[], products: Product[]): TopProduct[] => {
  const productSales: Record<string, TopProduct> = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      
      if (product) {
        if (!productSales[product.id]) {
          productSales[product.id] = { 
            id: product.id, 
            name: product.name, 
            count: 0, 
            revenue: 0 
          };
        }
        
        productSales[product.id].count += item.quantity;
        productSales[product.id].revenue += item.price * item.quantity;
      }
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export interface SalesDistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export const calculateSalesDistribution = (sales: Sale[], products: Product[]): SalesDistributionItem[] => {
  const distribution: Record<string, number> = {
    'Água': 0,
    'Refrigerante': 0,
    'Cerveja': 0,
    'Outros': 0,
  };
  
  let total = 0;
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const revenue = item.price * item.quantity;
        total += revenue;
        
        if (product.name.toLowerCase().includes('água')) {
          distribution['Água'] += revenue;
        } else if (product.name.toLowerCase().includes('refrigerante')) {
          distribution['Refrigerante'] += revenue;
        } else if (product.name.toLowerCase().includes('cerveja')) {
          distribution['Cerveja'] += revenue;
        } else {
          distribution['Outros'] += revenue;
        }
      }
    });
  });
  
  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0
  }));
};

// Missing import from previous code
import { format } from 'date-fns';
