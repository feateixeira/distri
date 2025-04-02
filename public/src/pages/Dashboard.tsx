
import React, { useMemo } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { 
  calculateDashboardMetrics, 
  prepareDailySalesData, 
  calculateTopProducts, 
  calculateSalesDistribution 
} from '@/utils/dashboardUtils';

// Import components
import MetricsSection from '@/components/dashboard/MetricsSection';
import DailySalesChart from '@/components/dashboard/DailySalesChart';
import SalesDistributionChart from '@/components/dashboard/SalesDistributionChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';

const Dashboard: React.FC = () => {
  const { products, inventory, sales } = useDatabase();

  // Calculate metrics
  const metrics = useMemo(() => 
    calculateDashboardMetrics(sales, products, inventory), 
    [sales, products, inventory]
  );

  // Prepare chart data
  const dailySalesData = useMemo(() => 
    prepareDailySalesData(sales), 
    [sales]
  );

  // Top selling products data
  const topProducts = useMemo(() =>
    calculateTopProducts(sales, products),
    [sales, products]
  );

  // Pie chart data for sales distribution
  const salesDistribution = useMemo(() =>
    calculateSalesDistribution(sales, products),
    [sales, products]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Metrics Cards */}
      <MetricsSection metrics={metrics} />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DailySalesChart data={dailySalesData} />
        <SalesDistributionChart data={salesDistribution} />
      </div>

      {/* Top Products Chart */}
      <TopProductsChart data={topProducts} />
    </div>
  );
};

export default Dashboard;
