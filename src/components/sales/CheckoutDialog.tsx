
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Banknote, CreditCard, Receipt } from 'lucide-react';
import { CartItemType } from './CartItem';

interface CheckoutDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  cart: CartItemType[];
  subTotal: number;
  totalDiscount: number;
  total: number;
  paymentMethod: string;
  processPayment: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  setOpen,
  cart,
  subTotal,
  totalDiscount,
  total,
  paymentMethod,
  processPayment
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
          <DialogDescription>
            Confirme os detalhes da venda abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between text-sm">
            <span>Total de itens:</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>R$ {subTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Desconto:</span>
            <span>R$ {totalDiscount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total a pagar:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          
          <div className="pt-2">
            <span className="text-sm font-medium">Forma de pagamento:</span>
            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md mt-1">
              {paymentMethod === 'cash' && <Banknote className="h-4 w-4" />}
              {(paymentMethod === 'credit' || paymentMethod === 'debit') && <CreditCard className="h-4 w-4" />}
              {paymentMethod === 'pix' && <Receipt className="h-4 w-4" />}
              <span>
                {paymentMethod === 'cash' && 'Dinheiro'}
                {paymentMethod === 'credit' && 'Cartão de Crédito'}
                {paymentMethod === 'debit' && 'Cartão de Débito'}
                {paymentMethod === 'pix' && 'PIX'}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={processPayment}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
