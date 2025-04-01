
import React, { useMemo } from 'react';
import { useDatabase, Sale } from '@/contexts/DatabaseContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUp, ArrowDown, 
  Package, ShoppingCart, 
  DollarSign, TrendingUp 
} from 'lucide-react';
import { format, subDays, isSameDay, parseISO, isAfter } from 'date-fns';

const Dashboard: React.FC = () => {
  const { products, inventory, sales } = useDatabase();

  // Get metrics
  const metrics = useMemo(() => {
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
  }, [sales, products, inventory]);

  // Prepare chart data
  const dailySalesData = useMemo(() => {
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
  }, [sales]);

  // Top selling products data
  const topProducts = useMemo(() => {
    const productSales: Record<string, { id: string, name: string, count: number, revenue: number }> = {};
    
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
  }, [sales, products]);

  // Pie chart data for sales distribution
  const salesDistribution = useMemo(() => {
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
  }, [sales, products]);

  // Colors for charts
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Semanal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.revenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.revenueChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.revenueChange > 0 ? "text-emerald-500" : "text-red-500"}>
                {Math.abs(metrics.revenueChange).toFixed(1)}%
              </span>
              <span className="ml-1">em relação à semana anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.profit.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>
                {(metrics.profit / metrics.revenue * 100).toFixed(1)}% de margem
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.transactions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.transactionChange > 0 ? (
                <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={metrics.transactionChange > 0 ? "text-emerald-500" : "text-red-500"}>
                {Math.abs(metrics.transactionChange).toFixed(1)}%
              </span>
              <span className="ml-1">em relação à semana anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Produtos abaixo do mínimo recomendado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Daily Sales Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Vendas da Semana</CardTitle>
            <CardDescription>
              Quantidade e receita de vendas nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailySalesData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#0088FE"
                  activeDot={{ r: 8 }}
                  name="Vendas"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF8042"
                  name="Receita (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Vendas</CardTitle>
            <CardDescription>
              Por categoria de produto
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
          <CardDescription>
            Os 5 produtos com maior volume de vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" name="Quantidade" />
              <Bar dataKey="revenue" fill="#00C49F" name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
