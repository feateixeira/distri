
// Definição dos tipos usados pelo contexto do banco de dados

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

export interface DatabaseContextType {
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
