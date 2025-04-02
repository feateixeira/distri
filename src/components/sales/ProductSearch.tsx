
import React, { useState } from 'react';
import { DatabaseContextType, Product } from '@/types/database';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';

interface ProductSearchProps {
  products: Product[];
  getProductByBarcode: DatabaseContextType['getProductByBarcode'];
  getInventoryForProduct: DatabaseContextType['getInventoryForProduct'];
  addToCart: (product: Product) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  getProductByBarcode,
  getInventoryForProduct,
  addToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
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

  return (
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
  );
};
