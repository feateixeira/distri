
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TopProduct } from '@/utils/dashboardUtils';

interface TopProductsChartProps {
  data: TopProduct[];
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  return (
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
            data={data}
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
  );
};

export default TopProductsChart;
