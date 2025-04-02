
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Receipt } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, CreditCard } from 'lucide-react';
import { CartItemType } from './CartItem';

interface CheckoutSummaryProps {
  cart: CartItemType[];
  subTotal: number;
  totalDiscount: number;
  total: number;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  applyTotalDiscount: (discount: string) => void;
  handleCheckout: () => void;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cart,
  subTotal,
  totalDiscount,
  total,
  paymentMethod,
  setPaymentMethod,
  applyTotalDiscount,
  handleCheckout
}) => {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Resumo da Venda</CardTitle>
        <CardDescription>
          Total de {cart.reduce((sum, item) => sum + item.quantity, 0)} itens no carrinho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>R$ {subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Desconto (R$):</span>
          <div className="flex items-center">
            <Input
              type="text"
              inputMode="decimal"
              className="w-24 text-right mr-2"
              value={totalDiscount.toFixed(2)}
              onChange={(e) => applyTotalDiscount(e.target.value)}
            />
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        
        <div className="pt-4">
          <Label>Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2" />
                  Dinheiro
                </div>
              </SelectItem>
              <SelectItem value="credit">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão de Crédito
                </div>
              </SelectItem>
              <SelectItem value="debit">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cartão de Débito
                </div>
              </SelectItem>
              <SelectItem value="pix">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  PIX
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          disabled={cart.length === 0}
          onClick={handleCheckout}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Finalizar Venda
        </Button>
      </CardFooter>
    </Card>
  );
};
