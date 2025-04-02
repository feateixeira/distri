
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: React.ReactNode;
  icon: LucideIcon;
  changeValue?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  changeValue 
}) => {
  const showChange = changeValue !== undefined;
  const isPositive = showChange && changeValue > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {showChange && (
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
              {Math.abs(changeValue).toFixed(1)}%
            </span>
            <span className="ml-1">em relação à semana anterior</span>
          </div>
        )}
        {description && !showChange && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
