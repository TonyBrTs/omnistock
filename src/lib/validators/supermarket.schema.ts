import { z } from 'zod';

export const DepartmentSchema = z.string().min(1, 'El departamento es obligatorio').max(100);
export const DepartmentEnum = DepartmentSchema;

export const CategorySchema = z.object({
  name: z.string().min(2, 'El nombre del departamento debe tener al menos 2 caracteres').max(100),
  code: z.string().max(20).optional(),
  defaultAisle: z.string().max(60).optional(),
  requiresColdChain: z.boolean().optional(),
});

export const StorageTemperatureEnum = z.enum([
  'Ambiente (Seco)',
  'Refrigerado (2°C a 6°C)',
  'Congelado (-18°C)',
]);

export const BaseUomEnum = z.enum(['Pza', 'Kg', 'Litro', 'Paq']);

export const BatchHealthStatusEnum = z.enum(['GOOD', 'LOW_STOCK', 'EXPIRED']);

export const MovementTypeEnum = z.enum([
  'PURCHASE_RECEIPT',
  'POS_SALE',
  'SHELF_REPLENISHMENT',
  'SHRINKAGE_EXPIRED',
  'INVENTORY_COUNT_ADJ',
]);

// Esquema de creación de Producto Maestro
export const CreateProductSchema = z.object({
  sku: z.string().min(3).max(50),
  barcodeEan13: z
    .string()
    .regex(/^[0-9]{8,14}$/, 'El código de barras debe ser numérico de 8 a 14 dígitos (EAN/UPC)'),
  pluCode: z.string().regex(/^[0-9]{4,5}$/, 'El código PLU debe tener 4 o 5 dígitos').optional(),
  name: z.string().min(3).max(200),
  brand: z.string().min(1).max(100),
  department: DepartmentEnum,
  baseUom: BaseUomEnum,
  purchasePackLabel: z.string().min(2).default('Unidad'),
  unitsPerPack: z.number().positive('Las unidades por paquete deben ser mayores a 0').default(1),
  storageCondition: StorageTemperatureEnum,
  isPerishable: z.boolean().default(true),
  unitCost: z.number().nonnegative(),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  taxRate: z.number().nonnegative().default(16.0),
  minStockAlert: z.number().nonnegative().default(10),
  reorderPoint: z.number().nonnegative().default(25),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Esquema de entrada de nuevo lote (Recepción de mercancía con fecha de vencimiento)
export const ReceiveBatchSchema = z.object({
  productId: z.string().uuid(),
  locationId: z.string().min(1),
  batchNumber: z.string().min(2).max(60),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (debe ser YYYY-MM-DD)'),
  quantity: z.number().positive('La cantidad a ingresar debe ser mayor a 0'),
  unitCost: z.number().nonnegative(),
  supplierInvoice: z.string().min(1, 'El folio de remisión o factura es obligatorio'),
  operatorName: z.string().min(2),
});

export type ReceiveBatchInput = z.infer<typeof ReceiveBatchSchema>;

// Esquema para despacho FEFO (Venta POS o Resurtido a Góndola)
export const DispatchStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  movementType: MovementTypeEnum,
  operatorName: z.string().min(2),
  referenceDocument: z.string().optional(),
  notes: z.string().optional(),
});

export type DispatchStockInput = z.infer<typeof DispatchStockSchema>;
