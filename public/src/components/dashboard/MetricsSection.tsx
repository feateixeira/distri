
import React from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import MetricCard from './MetricCard';
import { DashboardMetrics } from '@/utils/dashboardUtils';

interface MetricsSectionProps {
  metrics: DashboardMetrics;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <MetricCard
        title="Receita Semanal"
        value={`R$ ${metrics.revenue.toFixed(2)}`}
        icon={DollarSign}
        changeValue={metrics.revenueChange}
      />

      {/* Profit Card */}
      <MetricCard
        title="Lucro Semanal"
        value={`R$ ${metrics.profit.toFixed(2)}`}
        description={`${(metrics.profit / metrics.revenue * 100).toFixed(1)}% de margem`}
        icon={TrendingUp}
      />

      {/* Transactions Card */}
      <MetricCard
        title="Transações"
        value={metrics.transactions}
        icon={ShoppingCart}
        changeValue={metrics.transactionChange}
      />

      {/* Low Stock Card */}
      <MetricCard
        title="Estoque Baixo"
        value={metrics.lowStock}
        description="Produtos abaixo do mínimo recomendado"
        icon={Package}
      />
    </div>
  );
};

export default MetricsSection;
