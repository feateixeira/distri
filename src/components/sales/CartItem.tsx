
import React from 'react';
import { Product } from '@/types/database';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export interface CartItemType {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, newQuantity: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
  getInventoryForProduct: (productId: string) => any;
}

export const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onQuantityChange, 
  onUpdateQuantity, 
  onRemove,
  getInventoryForProduct 
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.product.name}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.productId, -1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            min="1"
            className="w-16 text-center p-1 h-7"
            value={item.quantity}
            onChange={(e) => onQuantityChange(item.productId, e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.productId, 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        R$ {item.price.toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-medium">
        R$ {item.total.toFixed(2)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500"
          onClick={() => onRemove(item.productId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
