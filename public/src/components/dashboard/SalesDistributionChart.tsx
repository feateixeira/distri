
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SalesDistributionItem } from '@/utils/dashboardUtils';

interface SalesDistributionChartProps {
  data: SalesDistributionItem[];
}

const SalesDistributionChart: React.FC<SalesDistributionChartProps> = ({ data }) => {
  // Colors for the chart
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
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
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesDistributionChart;
