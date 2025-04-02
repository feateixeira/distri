
import React, { useState } from 'react';
import { useDatabase, Product } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus,
  Minus,
  ShoppingCart,
  X,
  CreditCard,
  Banknote,
  Receipt,
  ArrowRight,
  PercentIcon
} from 'lucide-react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

const Sales: React.FC = () => {
  const { products, getProductByBarcode, getInventoryForProduct, addSale } = useDatabase();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [totalDiscount, setTotalDiscount] = useState(0);
  
  // Search products
  const filteredProducts = searchQuery.length > 1 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery)
      )
    : [];
  
  // Handle barcode detection
  const handleBarcodeDetected = (barcode: string) => {
    const product = getProductByBarcode(barcode);
    if (product) {
      addToCart(product);
      setSearchQuery('');
    } else {
      toast.error("Produto não encontrado");
    }
  };
  
  // Add product to cart
  const addToCart = (product: Product) => {
    // Check inventory
    const inventoryItem = getInventoryForProduct(product.id);
    const currentCartItem = cart.find(item => item.productId === product.id);
    const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0;
    
    if (inventoryItem && currentQuantityInCart + 1 > inventoryItem.currentQuantity) {
      toast.error(`Estoque insuficiente para ${product.name}`);
      return;
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update existing item
        return prev.map(item => {
          if (item.productId === product.id) {
            const newQuantity = item.quantity + 1;
            return {
              ...item,
              quantity: newQuantity,
              total: product.sellingPrice * newQuantity
            };
          }
          return item;
        });
      } else {
        // Add new item
        return [
          ...prev,
          {
            productId: product.id,
            product,
            quantity: 1,
            price: product.sellingPrice,
            total: product.sellingPrice
          }
        ];
      }
    });
  };
  
  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => 
      prev.filter(item => item.productId !== productId)
    );
  };
  
  // Update quantity
  const updateQuantity = (productId: string, change: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity + change);
          
          // Check inventory
          const inventoryItem = getInventoryForProduct(productId);
          if (inventoryItem && newQuantity > inventoryItem.currentQuantity) {
            toast.error(`Estoque insuficiente para ${item.product.name}`);
            return item;
          }
          
          return {
            ...item,
            quantity: newQuantity,
            total: item.price * newQuantity
          };
        }
        return item;
      })
    );
  };
  
  // Handle direct quantity input
  const handleQuantityChange = (productId: string, newQuantity: string) => {
    // Convert input to number, default to 1 if invalid
    const quantity = parseInt(newQuantity, 10);
    
    if (isNaN(quantity) || quantity <= 0) {
      return; // Don't update for invalid input
    }
    
    // Check inventory
    const inventoryItem = getInventoryForProduct(productId);
    if (inventoryItem && quantity > inventoryItem.currentQuantity) {
      toast.error(`Estoque insuficiente. Máximo disponível: ${inventoryItem.currentQuantity}`);
      return;
    }
    
    setCart(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            total: item.price * quantity
          };
        }
        return item;
      })
    );
  };

  // Apply discount to total
  const applyTotalDiscount = (discount: string) => {
    const parsedDiscount = parseFloat(discount) || 0;
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Ensure discount doesn't exceed subtotal
    setTotalDiscount(Math.min(parsedDiscount, subTotal));
  };
  
  // Calculate totals
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subTotal - totalDiscount;
  
  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("O carrinho está vazio");
      return;
    }
    
    setIsCheckoutDialogOpen(true);
  };
  
  // Process payment
  const processPayment = () => {
    if (cart.length === 0) return;
    
    const sale = {
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: 0 // Individual item discount is now 0
      })),
      total,
      totalDiscount, // Store the total discount
      paymentMethod,
      sellerName: user?.username || 'unknown'
    };
    
    addSale(sale);
    
    // Reset cart
    setCart([]);
    setTotalDiscount(0);
    setIsCheckoutDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search and Cart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Buscar Produtos</h2>
          <div className="space-y-4">
            <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos por nome ou código de barras"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {searchQuery.length > 1 && (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.barcode}</TableCell>
                          <TableCell className="text-right">
                            R$ {product.sellingPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                addToCart(product);
                                setSearchQuery('');
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-12 text-center">
                          {searchQuery.length > 1 ? 'Nenhum produto encontrado.' : 'Digite para buscar produtos'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </div>
        
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
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.productId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              className="w-16 text-center p-1 h-7"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.productId, 1)}
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
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
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
      </div>
      
      {/* Checkout */}
      <div className="lg:col-span-1">
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
              <span className="text-muted-foreground">Desconto:</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24 text-right mr-2"
                  value={totalDiscount}
                  onChange={(e) => applyTotalDiscount(e.target.value)}
                />
                <PercentIcon className="h-4 w-4 text-muted-foreground" />
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
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={processPayment}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;

