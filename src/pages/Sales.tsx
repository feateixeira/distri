
import React, { useState } from 'react';
import { useDatabase, Product } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProductSearch } from '@/components/sales/ProductSearch';
import { ShoppingCart } from '@/components/sales/ShoppingCart';
import { CheckoutSummary } from '@/components/sales/CheckoutSummary';
import { CheckoutDialog } from '@/components/sales/CheckoutDialog';
import { CartItemType } from '@/components/sales/CartItem';

const Sales: React.FC = () => {
  const { products, getProductByBarcode, getInventoryForProduct, addSale } = useDatabase();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [totalDiscount, setTotalDiscount] = useState(0);
  
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
        <ProductSearch 
          products={products} 
          getProductByBarcode={getProductByBarcode} 
          getInventoryForProduct={getInventoryForProduct} 
          addToCart={addToCart} 
        />
        
        <ShoppingCart 
          cart={cart}
          updateQuantity={updateQuantity}
          handleQuantityChange={handleQuantityChange}
          removeFromCart={removeFromCart}
          getInventoryForProduct={getInventoryForProduct}
        />
      </div>
      
      {/* Checkout */}
      <div className="lg:col-span-1">
        <CheckoutSummary 
          cart={cart}
          subTotal={subTotal}
          totalDiscount={totalDiscount}
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          applyTotalDiscount={applyTotalDiscount}
          handleCheckout={handleCheckout}
        />
      </div>
      
      {/* Checkout Dialog */}
      <CheckoutDialog 
        open={isCheckoutDialogOpen}
        setOpen={setIsCheckoutDialogOpen}
        cart={cart}
        subTotal={subTotal}
        totalDiscount={totalDiscount}
        total={total}
        paymentMethod={paymentMethod}
        processPayment={processPayment}
      />
    </div>
  );
};

export default Sales;
