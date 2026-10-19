export type BatchHealthStatus = 'GOOD' | 'LOW_STOCK' | 'EXPIRED';

export type StorageTemperature =
  | 'Ambiente (Seco)'
  | 'Refrigerado (2°C a 6°C)'
  | 'Congelado (-18°C)';

export type StoreDepartment =
  | 'Lácteos y Refrigerados'
  | 'Frutas y Verduras'
  | 'Carnicería y Salchichonería'
  | 'Abarrotes y Despensa'
  | 'Bebidas y Licores'
  | 'Panadería';

export interface SupermarketProductRow {
  id: string;
  sku: string;
  barcodeEan13: string;
  pluCode?: string;
  name: string;
  brand: string;
  department: StoreDepartment;
  /** Dónde está colocado en la tienda */
  aisleLocation: string;
  batchNumber: string;
  expirationDate: string;
  daysToExpire: number | null;
  storageTemp: StorageTemperature;
  /** Cuántos hay en los estantes / exhibición */
  shelfStock: number;
  /** Cuántos hay guardados en bodega / almacén */
  backroomStock: number;
  /** TOTAL GLOBAL en toda la tienda (estantes + bodega) */
  stockQuantity: number;
  minStockAlert: number;
  baseUom: 'Pza' | 'Kg' | 'Litro' | 'Paq';
  packEquivalence: string;
  unitCost: number;
  salePrice: number;
  status: BatchHealthStatus;
}

export interface StoreMetricCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  badgeText: string;
  variant: 'good' | 'warning' | 'danger' | 'info';
  icon: 'barcode' | 'cold-chain' | 'low-stock' | 'expiry-alert';
}
