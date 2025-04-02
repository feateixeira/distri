
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CartItem, CartItemType } from './CartItem';

interface ShoppingCartProps {
  cart: CartItemType[];
  updateQuantity: (productId: string, change: number) => void;
  handleQuantityChange: (productId: string, newQuantity: string) => void;
  removeFromCart: (productId: string) => void;
  getInventoryForProduct: (productId: string) => any;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  updateQuantity,
  handleQuantityChange,
  removeFromCart,
  getInventoryForProduct
}) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Carrinho</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead className="text-right">Preço Unit</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <CartItem 
                    key={item.productId}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    getInventoryForProduct={getInventoryForProduct}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carrinho vazio. Adicione produtos para iniciar uma venda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
