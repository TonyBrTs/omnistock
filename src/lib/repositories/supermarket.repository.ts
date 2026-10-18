import { v4 as uuidv4 } from 'uuid';
import {
  CreateProductInput,
  ReceiveBatchInput,
  DispatchStockInput,
} from '@/lib/validators/supermarket.schema';
import {
  SupermarketProductRow,
  BatchHealthStatus,
} from '@/types/supermarket';

export interface BatchEntity {
  batchId: string;
  productId: string;
  locationId: string;
  locationName: string;
  batchNumber: string;
  expirationDate: string; // YYYY-MM-DD
  quantityOnHand: number;
  unitCost: number;
  status: BatchHealthStatus;
  receivedAt: string;
}

export interface StockMovementEntity {
  movementId: string;
  productId: string;
  batchId: string;
  locationId: string;
  movementType: string;
  quantityDelta: number;
  balanceAfter: number;
  unitCostSnapshot: number;
  referenceDocument?: string;
  operatorName: string;
  notes?: string;
  occurredAt: string;
}

export class SupermarketRepository {
  private static instance: SupermarketRepository;

  public products: SupermarketProductRow[] = [];
  public batches: BatchEntity[] = [];
  public movements: StockMovementEntity[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): SupermarketRepository {
    if (!SupermarketRepository.instance) {
      SupermarketRepository.instance = new SupermarketRepository();
    }
    return SupermarketRepository.instance;
  }

  // Calcula días restantes y estado de salud FEFO
  public static calculateHealthStatus(
    expirationDate: string,
    currentStock: number,
    minStock: number
  ): { status: BatchHealthStatus; daysToExpire: number } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exp = new Date(expirationDate);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const daysToExpire = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysToExpire <= 0) {
      return { status: 'EXPIRED', daysToExpire };
    }
    if (daysToExpire <= 7 || currentStock <= minStock) {
      return { status: 'LOW_STOCK', daysToExpire };
    }
    return { status: 'GOOD', daysToExpire };
  }

  private seedInitialData() {
    const p1Id = uuidv4();
    const b1Id = uuidv4();
    const p2Id = uuidv4();
    const b2Id = uuidv4();
    const p3Id = uuidv4();
    const b3Id = uuidv4();

    this.batches.push({
      batchId: b1Id,
      productId: p1Id,
      locationId: 'loc-aisle-2',
      locationName: 'Pasillo 02 · Góndola Fría A',
      batchNumber: 'LOT-2610-A1',
      expirationDate: '2026-11-04',
      quantityOnHand: 144,
      unitCost: 21.5,
      status: 'GOOD',
      receivedAt: new Date().toISOString(),
    });

    this.products.push({
      id: p1Id,
      sku: 'LAC-LECH-01',
      barcodeEan13: '7501055300128',
      name: 'Leche Entera Pasteurizada 1 Litro',
      brand: 'Santa Clara',
      department: 'Lácteos y Refrigerados',
      aisleLocation: 'Pasillo 02 · Góndola Fría A',
      batchNumber: 'LOT-2610-A1',
      expirationDate: '2026-11-04',
      daysToExpire: 17,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      stockQuantity: 144,
      minStockAlert: 36,
      baseUom: 'Pza',
      packEquivalence: '1 Caja = 12 Tetrapacks',
      unitCost: 21.5,
      salePrice: 28.9,
      status: 'GOOD',
    });

    this.batches.push({
      batchId: b2Id,
      productId: p2Id,
      locationId: 'loc-deli-1',
      locationName: 'Vitrina Salchichonería #2',
      batchNumber: 'LOT-2610-F9',
      expirationDate: '2026-10-22',
      quantityOnHand: 8,
      unitCost: 62.0,
      status: 'LOW_STOCK',
      receivedAt: new Date().toISOString(),
    });

    this.products.push({
      id: p2Id,
      sku: 'CAR-PAVO-04',
      barcodeEan13: '7501031311309',
      pluCode: '4820',
      name: 'Pechuga de Pavo Virginia Rebanada 250g',
      brand: 'Peñaranda',
      department: 'Carnicería y Salchichonería',
      aisleLocation: 'Vitrina Salchichonería #2',
      batchNumber: 'LOT-2610-F9',
      expirationDate: '2026-10-22',
      daysToExpire: 4,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      stockQuantity: 8,
      minStockAlert: 15,
      baseUom: 'Paq',
      packEquivalence: '1 Master = 10 Paquetes',
      unitCost: 62.0,
      salePrice: 89.5,
      status: 'LOW_STOCK',
    });

    this.batches.push({
      batchId: b3Id,
      productId: p3Id,
      locationId: 'loc-cold-room-1',
      locationName: 'Cuarentena Cámara Fría 1',
      batchNumber: 'LOT-2609-Z4',
      expirationDate: '2026-10-16',
      quantityOnHand: 5,
      unitCost: 78.0,
      status: 'EXPIRED',
      receivedAt: new Date().toISOString(),
    });

    this.products.push({
      id: p3Id,
      sku: 'LAC-YOG-09',
      barcodeEan13: '7509988123004',
      name: 'Yogurt Griego Natural Sin Azúcar 750g',
      brand: 'Chobani',
      department: 'Lácteos y Refrigerados',
      aisleLocation: 'Cuarentena Cámara Fría 1',
      batchNumber: 'LOT-2609-Z4',
      expirationDate: '2026-10-16',
      daysToExpire: -2,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      stockQuantity: 5,
      minStockAlert: 12,
      baseUom: 'Pza',
      packEquivalence: '1 Charola = 6 Envases',
      unitCost: 78.0,
      salePrice: 112.0,
      status: 'EXPIRED',
    });
  }

  // Recalcula el producto consolidando el lote activo más próximo a vencer (FEFO)
  private refreshProductView(productId: string) {
    const productIndex = this.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) return;

    const productBatches = this.batches.filter((b) => b.productId === productId);
    const activeBatches = productBatches.filter((b) => b.quantityOnHand > 0);

    // Total de stock físico disponible
    const totalStock = activeBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);

    // Ordenamiento FEFO: fecha de caducidad más próxima primero
    const fefoSorted = [...activeBatches].sort((a, b) => {
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

    const currentLeadingBatch = fefoSorted[0] || productBatches[0];

    if (currentLeadingBatch) {
      const { status, daysToExpire } = SupermarketRepository.calculateHealthStatus(
        currentLeadingBatch.expirationDate,
        totalStock,
        this.products[productIndex].minStockAlert
      );

      this.products[productIndex] = {
        ...this.products[productIndex],
        stockQuantity: totalStock,
        batchNumber: currentLeadingBatch.batchNumber,
        expirationDate: currentLeadingBatch.expirationDate,
        daysToExpire,
        status,
        aisleLocation: currentLeadingBatch.locationName,
      };
    }
  }

  // Registrar Entrada de Lote (Recepción de Proveedor)
  public receiveBatch(input: ReceiveBatchInput): { batch: BatchEntity; movement: StockMovementEntity } {
    const product = this.products.find((p) => p.id === input.productId);
    if (!product) throw new Error(`Producto ${input.productId} no encontrado`);

    const { status } = SupermarketRepository.calculateHealthStatus(
      input.expirationDate,
      product.stockQuantity + input.quantity,
      product.minStockAlert
    );

    const newBatch: BatchEntity = {
      batchId: uuidv4(),
      productId: input.productId,
      locationId: input.locationId,
      locationName: input.locationId === 'loc-cold' ? 'Cámara Fría #1' : 'Bodega Central Recepción',
      batchNumber: input.batchNumber,
      expirationDate: input.expirationDate,
      quantityOnHand: input.quantity,
      unitCost: input.unitCost,
      status,
      receivedAt: new Date().toISOString(),
    };

    this.batches.push(newBatch);

    const newBalance = product.stockQuantity + input.quantity;
    const movement: StockMovementEntity = {
      movementId: uuidv4(),
      productId: input.productId,
      batchId: newBatch.batchId,
      locationId: newBatch.locationId,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: input.quantity,
      balanceAfter: newBalance,
      unitCostSnapshot: input.unitCost,
      referenceDocument: input.supplierInvoice,
      operatorName: input.operatorName,
      notes: `Recepción de lote FEFO ${input.batchNumber}`,
      occurredAt: new Date().toISOString(),
    };

    this.movements.push(movement);
    this.refreshProductView(input.productId);

    return { batch: newBatch, movement };
  }

  // Despacho FEFO (Venta POS o Resurtido): Descuenta automáticamente del lote más próximo a caducar
  public dispatchStockFEFO(input: DispatchStockInput): StockMovementEntity[] {
    const product = this.products.find((p) => p.id === input.productId);
    if (!product) throw new Error(`Producto ${input.productId} no encontrado`);

    const availableBatches = this.batches
      .filter((b) => b.productId === input.productId && b.quantityOnHand > 0)
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    const totalAvailable = availableBatches.reduce((acc, b) => acc + b.quantityOnHand, 0);
    if (totalAvailable < input.quantity) {
      throw new Error(`Stock insuficiente. Solicitado: ${input.quantity}, Disponible: ${totalAvailable}`);
    }

    let remainingToDispatch = input.quantity;
    const generatedMovements: StockMovementEntity[] = [];

    for (const batch of availableBatches) {
      if (remainingToDispatch <= 0) break;

      const takeFromBatch = Math.min(batch.quantityOnHand, remainingToDispatch);
      batch.quantityOnHand -= takeFromBatch;
      remainingToDispatch -= takeFromBatch;

      const movement: StockMovementEntity = {
        movementId: uuidv4(),
        productId: input.productId,
        batchId: batch.batchId,
        locationId: batch.locationId,
        movementType: input.movementType,
        quantityDelta: -takeFromBatch,
        balanceAfter: product.stockQuantity - takeFromBatch,
        unitCostSnapshot: batch.unitCost,
        referenceDocument: input.referenceDocument,
        operatorName: input.operatorName,
        notes: input.notes || `Despacho FEFO de lote ${batch.batchNumber}`,
        occurredAt: new Date().toISOString(),
      };

      this.movements.push(movement);
      generatedMovements.push(movement);
    }

    this.refreshProductView(input.productId);
    return generatedMovements;
  }

  // Registrar Merma / Caducidad
  public markBatchAsShrinkage(batchNumber: string, operatorName: string, reason: string): StockMovementEntity | null {
    const batch = this.batches.find((b) => b.batchNumber === batchNumber);
    if (!batch) return null;

    const qtyToLoss = batch.quantityOnHand;
    batch.quantityOnHand = 0;
    batch.status = 'EXPIRED';

    const movement: StockMovementEntity = {
      movementId: uuidv4(),
      productId: batch.productId,
      batchId: batch.batchId,
      locationId: batch.locationId,
      movementType: 'SHRINKAGE_EXPIRED',
      quantityDelta: -qtyToLoss,
      balanceAfter: 0,
      unitCostSnapshot: batch.unitCost,
      referenceDocument: 'ACTA-MERMA',
      operatorName,
      notes: reason,
      occurredAt: new Date().toISOString(),
    };

    this.movements.push(movement);
    this.refreshProductView(batch.productId);
    return movement;
  }
}
