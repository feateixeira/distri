
import React, { useState } from 'react';
import { useDatabase, Product } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';
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
  Edit,
  Save, 
  X,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import { LowStockAlert } from '@/components/LowStockAlert';
import { LowStockBanner } from '@/components/LowStockBanner';

const Inventory: React.FC = () => {
  const { products, inventory, updateInventory, getProduct, getInventoryForProduct } = useDatabase();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    currentQuantity: '',
    minQuantity: '',
    maxQuantity: ''
  });
  
  // Open update inventory dialog
  const handleOpenUpdateDialog = (product: Product) => {
    if (!isAdmin) {
      return; // Only allow admins to update inventory
    }

    setCurrentProduct(product);
    
    // Get current inventory for this product
    const inventoryItem = getInventoryForProduct(product.id);
    
    setFormData({
      currentQuantity: inventoryItem ? inventoryItem.currentQuantity.toString() : '0',
      minQuantity: inventoryItem ? inventoryItem.minQuantity.toString() : '10',
      maxQuantity: inventoryItem ? inventoryItem.maxQuantity.toString() : '100'
    });
    
    setIsUpdateDialogOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle update inventory submit
  const handleUpdateSubmit = () => {
    if (!currentProduct || !isAdmin) return;
    
    updateInventory({
      productId: currentProduct.id,
      currentQuantity: parseInt(formData.currentQuantity || '0'),
      minQuantity: parseInt(formData.minQuantity || '0'),
      maxQuantity: parseInt(formData.maxQuantity || '0')
    });
    
    setIsUpdateDialogOpen(false);
    setCurrentProduct(null);
  };
  
  // Get combined product and inventory data
  const inventoryData = products.map(product => {
    const inventoryItem = getInventoryForProduct(product.id);
    return {
      product,
      inventory: inventoryItem || {
        id: '',
        productId: product.id,
        currentQuantity: 0,
        minQuantity: 0,
        maxQuantity: 0,
        updatedAt: new Date().toISOString()
      }
    };
  });
  
  // Filter inventory based on search and status filter
  const filteredInventory = inventoryData.filter(item => {
    // Apply search filter
    const matchesSearch = 
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.barcode.includes(search);
    
    // Apply status filter
    let matchesStatus = true;
    if (filter === 'low') {
      matchesStatus = item.inventory.currentQuantity < item.inventory.minQuantity;
    } else if (filter === 'normal') {
      matchesStatus = 
        item.inventory.currentQuantity >= item.inventory.minQuantity &&
        item.inventory.currentQuantity <= item.inventory.maxQuantity;
    } else if (filter === 'high') {
      matchesStatus = item.inventory.currentQuantity > item.inventory.maxQuantity;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  // Get status indicator for inventory level
  const getStatusIndicator = (current: number, min: number, max: number) => {
    if (current < min) {
      return (
        <div className="flex items-center text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          Baixo
        </div>
      );
    } else if (current > max) {
      return (
        <div className="flex items-center text-amber-500">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Alto
        </div>
      );
    } else {
      return <div className="text-green-500">Normal</div>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Componente de alerta periódico (não visível) */}
      <LowStockAlert />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
      </div>
      
      {/* Banner de alerta para itens com estoque baixo */}
      <LowStockBanner />
      
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos por nome ou código de barras"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[180px]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os itens</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="normal">Estoque normal</SelectItem>
              <SelectItem value="high">Estoque alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead className="text-right">Quantidade Atual</TableHead>
              <TableHead className="text-right">Quantidade Mínima</TableHead>
              <TableHead className="text-right">Quantidade Máxima</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Última Atualização</TableHead>
              {isAdmin && <TableHead className="w-[80px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map(({ product, inventory }) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell className="text-right">{inventory.currentQuantity}</TableCell>
                  <TableCell className="text-right">{inventory.minQuantity}</TableCell>
                  <TableCell className="text-right">{inventory.maxQuantity}</TableCell>
                  <TableCell>
                    {getStatusIndicator(
                      inventory.currentQuantity, 
                      inventory.minQuantity, 
                      inventory.maxQuantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {inventory.id ? 
                      format(parseISO(inventory.updatedAt), 'dd/MM/yyyy HH:mm') : 
                      'Não atualizado'
                    }
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenUpdateDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Update Inventory Dialog */}
      {isAdmin && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Atualizar Estoque</DialogTitle>
              <DialogDescription>
                {currentProduct && (
                  <>Atualizar estoque para: <strong>{currentProduct.name}</strong></>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentQuantity">Quantidade Atual</Label>
                <Input
                  id="currentQuantity"
                  name="currentQuantity"
                  type="number"
                  min="0"
                  value={formData.currentQuantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    type="number"
                    min="0"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxQuantity">Quantidade Máxima</Label>
                  <Input
                    id="maxQuantity"
                    name="maxQuantity"
                    type="number"
                    min="0"
                    value={formData.maxQuantity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleUpdateSubmit}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
