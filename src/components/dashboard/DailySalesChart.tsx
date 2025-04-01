
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DailySalesData } from '@/utils/dashboardUtils';

interface DailySalesChartProps {
  data: DailySalesData[];
}

const DailySalesChart: React.FC<DailySalesChartProps> = ({ data }) => {
  return (
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
            data={data}
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
  );
};

export default DailySalesChart;
