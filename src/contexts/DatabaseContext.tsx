
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  updatedAt: string;
}

export interface Sale {
  id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  total: number;
  paymentMethod: string;
  createdAt: string;
  sellerName: string;
}

interface DatabaseContextType {
  products: Product[];
  inventory: InventoryItem[];
  sales: Sale[];
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProduct: (id: string) => void;
  
  updateInventory: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  
  getProduct: (id: string) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  getInventoryForProduct: (productId: string) => InventoryItem | undefined;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Sample data for initial state
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Água Mineral 500ml',
    barcode: '7891000000001',
    purchasePrice: 0.75,
    sellingPrice: 2.00,
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString()
  },
  {
    id: '2',
    name: 'Refrigerante Cola 2L',
    barcode: '7891000000002',
    purchasePrice: 4.50,
    sellingPrice: 7.99,
    createdAt: new Date(2023, 0, 10).toISOString(),
    updatedAt: new Date(2023, 1, 5).toISOString()
  },
  {
    id: '3',
    name: 'Cerveja Lager 350ml',
    barcode: '7891000000003',
    purchasePrice: 1.75,
    sellingPrice: 3.99,
    createdAt: new Date(2023, 1, 1).toISOString(),
    updatedAt: new Date(2023, 1, 1).toISOString()
  }
];

const sampleInventory: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    currentQuantity: 120,
    minQuantity: 30,
    maxQuantity: 200,
    updatedAt: new Date(2023, 0, 15).toISOString()
  },
  {
    id: '2',
    productId: '2',
    currentQuantity: 45,
    minQuantity: 20,
    maxQuantity: 100,
    updatedAt: new Date(2023, 1, 5).toISOString()
  },
  {
    id: '3',
    productId: '3',
    currentQuantity: 72,
    minQuantity: 24,
    maxQuantity: 144,
    updatedAt: new Date(2023, 1, 1).toISOString()
  }
];

const sampleSales: Sale[] = [
  {
    id: '1',
    items: [
      { productId: '1', quantity: 5, price: 2.00, discount: 0 },
      { productId: '2', quantity: 2, price: 7.99, discount: 0 }
    ],
    total: 25.98,
    paymentMethod: 'cash',
    createdAt: new Date(2023, 1, 10).toISOString(),
    sellerName: 'funcionario'
  },
  {
    id: '2',
    items: [
      { productId: '3', quantity: 6, price: 3.99, discount: 2.00 }
    ],
    total: 21.94,
    paymentMethod: 'credit',
    createdAt: new Date(2023, 1, 15).toISOString(),
    sellerName: 'funcionario'
  }
];

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedProducts = localStorage.getItem('products');
    const loadedInventory = localStorage.getItem('inventory');
    const loadedSales = localStorage.getItem('sales');

    setProducts(loadedProducts ? JSON.parse(loadedProducts) : sampleProducts);
    setInventory(loadedInventory ? JSON.parse(loadedInventory) : sampleInventory);
    setSales(loadedSales ? JSON.parse(loadedSales) : sampleSales);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const getProduct = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  const getProductByBarcode = useCallback((barcode: string) => {
    return products.find(product => product.barcode === barcode);
  }, [products]);

  const getInventoryForProduct = useCallback((productId: string) => {
    return inventory.find(item => item.productId === productId);
  }, [inventory]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    setProducts(prev => [...prev, newProduct]);
    toast.success("Produto adicionado com sucesso");
  }, []);

  const updateProduct = useCallback((id: string, update: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return {
          ...product,
          ...update,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    }));
    toast.success("Produto atualizado com sucesso");
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    setInventory(prev => prev.filter(item => item.productId !== id));
    toast.success("Produto excluído com sucesso");
  }, []);

  const updateInventory = useCallback((item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    setInventory(prev => {
      const existingItem = prev.find(i => i.productId === item.productId);
      if (existingItem) {
        return prev.map(i => {
          if (i.productId === item.productId) {
            return {
              ...i,
              ...item,
              updatedAt: now
            };
          }
          return i;
        });
      } else {
        return [...prev, {
          ...item, 
          id: crypto.randomUUID(),
          updatedAt: now
        }];
      }
    });
    toast.success("Estoque atualizado com sucesso");
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      createdAt: now
    };
    
    // Update inventory based on sale
    sale.items.forEach(item => {
      setInventory(prev => prev.map(i => {
        if (i.productId === item.productId) {
          return {
            ...i,
            currentQuantity: i.currentQuantity - item.quantity,
            updatedAt: now
          };
        }
        return i;
      }));
    });
    
    setSales(prev => [...prev, newSale]);
    toast.success("Venda registrada com sucesso");
  }, []);

  const value = {
    products,
    inventory,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    updateInventory,
    addSale,
    getProduct,
    getProductByBarcode,
    getInventoryForProduct
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
