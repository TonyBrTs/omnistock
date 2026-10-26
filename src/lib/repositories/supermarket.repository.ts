import { v4 as uuidv4 } from 'uuid';
import type {
  ReceiveBatchInput,
  DispatchStockInput,
} from '@/lib/validators/supermarket.schema';
import type {
  SupermarketProductRow,
  BatchHealthStatus,
  StoreCategory,
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
  public categories: StoreCategory[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): SupermarketRepository {
    if (!SupermarketRepository.instance) {
      SupermarketRepository.instance = new SupermarketRepository();
    }
    return SupermarketRepository.instance;
  }

  // Calcula días restantes y estado del producto
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
    const p4Id = uuidv4();
    const b4Id = uuidv4();

    this.categories = [
      { id: uuidv4(), name: 'Abarrotes y Despensa', code: 'ABAR', defaultAisle: 'Pasillo 01', requiresColdChain: false },
      { id: uuidv4(), name: 'Lácteos y Refrigerados', code: 'LACT', defaultAisle: 'Pasillo 02 · Vitrina Fría', requiresColdChain: true },
      { id: uuidv4(), name: 'Carnicería y Salchichonería', code: 'CARN', defaultAisle: 'Vitrina Salchichonería #2', requiresColdChain: true },
      { id: uuidv4(), name: 'Frutas y Verduras', code: 'FRUT', defaultAisle: 'Isla Frutas #1', requiresColdChain: false },
      { id: uuidv4(), name: 'Bebidas y Licores', code: 'BEB', defaultAisle: 'Pasillo 04', requiresColdChain: false },
      { id: uuidv4(), name: 'Panadería', code: 'PAN', defaultAisle: 'Área Panadería', requiresColdChain: false },
      { id: uuidv4(), name: 'Cuidado Personal y Farmacia', code: 'FARM', defaultAisle: 'Pasillo 05', requiresColdChain: false },
      { id: uuidv4(), name: 'Limpieza y Hogar', code: 'LIMP', defaultAisle: 'Pasillo 06', requiresColdChain: false },
    ];

    // 1. Leche: 48 en estante exhibidor + 96 en bodega = 144 Total Tienda
    this.batches.push({
      batchId: b1Id,
      productId: p1Id,
      locationId: 'loc-aisle-2',
      locationName: 'Pasillo 02 · Vitrina Fría',
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
      name: 'Leche Entera 1 Litro',
      brand: 'Santa Clara',
      department: 'Lácteos y Refrigerados',
      aisleLocation: 'Pasillo 02 · Vitrina Fría',
      batchNumber: 'LOT-2610-A1',
      expirationDate: '2026-11-04',
      daysToExpire: 17,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      shelfStock: 48,
      backroomStock: 96,
      stockQuantity: 144, // Total en toda la tienda
      minStockAlert: 36,
      baseUom: 'Pza',
      packEquivalence: '1 Caja = 12 Piezas',
      unitCost: 21.5,
      salePrice: 28.9,
      status: 'GOOD',
    });

    // 2. Pechuga de Pavo: 6 en vitrina + 2 en bodega = 8 Total Tienda
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
      name: 'Pechuga de Pavo 250g',
      brand: 'Peñaranda',
      department: 'Carnicería y Salchichonería',
      aisleLocation: 'Vitrina Salchichonería #2',
      batchNumber: 'LOT-2610-F9',
      expirationDate: '2026-10-22',
      daysToExpire: 4,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      shelfStock: 6,
      backroomStock: 2,
      stockQuantity: 8,
      minStockAlert: 15,
      baseUom: 'Paq',
      packEquivalence: '1 Paquete = 10 piezas',
      unitCost: 62.0,
      salePrice: 89.5,
      status: 'LOW_STOCK',
    });

    // 3. Yogurt Griego: 5 vencidos en tienda
    this.batches.push({
      batchId: b3Id,
      productId: p3Id,
      locationId: 'loc-cold-room-1',
      locationName: 'Estante de Yogurts',
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
      name: 'Yogurt Griego Natural 750g',
      brand: 'Chobani',
      department: 'Lácteos y Refrigerados',
      aisleLocation: 'Estante de Yogurts',
      batchNumber: 'LOT-2609-Z4',
      expirationDate: '2026-10-16',
      daysToExpire: -2,
      storageTemp: 'Refrigerado (2°C a 6°C)',
      shelfStock: 5,
      backroomStock: 0,
      stockQuantity: 5,
      minStockAlert: 12,
      baseUom: 'Pza',
      packEquivalence: '1 Charola = 6 Piezas',
      unitCost: 78.0,
      salePrice: 112.0,
      status: 'EXPIRED',
    });

    // 4. Aguacate Hass: 35 kg en isla + 57.5 kg en bodega = 92.5 Kg Total
    this.batches.push({
      batchId: b4Id,
      productId: p4Id,
      locationId: 'loc-fruit-1',
      locationName: 'Isla Frutas #1',
      batchNumber: 'LOT-SEM42-MX',
      expirationDate: '2026-10-26',
      quantityOnHand: 92.5,
      unitCost: 48.0,
      status: 'GOOD',
      receivedAt: new Date().toISOString(),
    });

    this.products.push({
      id: p4Id,
      sku: 'FRU-AGU-01',
      barcodeEan13: '2004022000001',
      pluCode: '4225',
      name: 'Aguacate Hass Selección Extra',
      brand: 'Huerta Michoacán',
      department: 'Frutas y Verduras',
      aisleLocation: 'Isla Frutas #1',
      batchNumber: 'LOT-SEM42-MX',
      expirationDate: '2026-10-26',
      daysToExpire: 8,
      storageTemp: 'Ambiente (Seco)',
      shelfStock: 35,
      backroomStock: 57.5,
      stockQuantity: 92.5,
      minStockAlert: 25,
      baseUom: 'Kg',
      packEquivalence: '1 Reja = 18 Kg',
      unitCost: 48.0,
      salePrice: 74.9,
      status: 'GOOD',
    });
  }

  // Recalcula el producto consolidando el stock total de la tienda
  private refreshProductView(productId: string) {
    const productIndex = this.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) return;

    const productBatches = this.batches.filter((b) => b.productId === productId);
    const activeBatches = productBatches.filter((b) => b.quantityOnHand > 0);

    // TOTAL GLOBAL DE MERCANCÍA EN TODA LA TIENDA
    const totalGlobalStock = activeBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);

    // Ordenamiento FEFO
    const fefoSorted = [...activeBatches].sort((a, b) => {
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

    const currentLeadingBatch = fefoSorted[0] || productBatches[0];

    if (currentLeadingBatch) {
      const { status, daysToExpire } = SupermarketRepository.calculateHealthStatus(
        currentLeadingBatch.expirationDate,
        totalGlobalStock,
        this.products[productIndex].minStockAlert
      );

      // Conservar proporción de estante o recalcular si bajó de stock
      const currentShelf = Math.min(this.products[productIndex].shelfStock, totalGlobalStock);
      const currentBackroom = Math.max(0, totalGlobalStock - currentShelf);

      this.products[productIndex] = {
        ...this.products[productIndex],
        stockQuantity: totalGlobalStock,
        shelfStock: currentShelf,
        backroomStock: currentBackroom,
        batchNumber: currentLeadingBatch.batchNumber,
        expirationDate: currentLeadingBatch.expirationDate,
        daysToExpire,
        status,
        aisleLocation: currentLeadingBatch.locationName,
      };
    }
  }

  // Registrar Entrada de Mercancía Nueva
  public receiveBatch(input: ReceiveBatchInput): { batch: BatchEntity; movement: StockMovementEntity } {
    const product = this.products.find((p) => p.id === input.productId);
    if (!product) throw new Error(`Producto ${input.productId} no encontrado`);

    const newTotal = product.stockQuantity + input.quantity;

    const { status } = SupermarketRepository.calculateHealthStatus(
      input.expirationDate,
      newTotal,
      product.minStockAlert
    );

    const newBatch: BatchEntity = {
      batchId: uuidv4(),
      productId: input.productId,
      locationId: input.locationId,
      locationName: input.locationId === 'loc-cold' ? 'Refrigerador' : 'Bodega Central',
      batchNumber: input.batchNumber,
      expirationDate: input.expirationDate,
      quantityOnHand: input.quantity,
      unitCost: input.unitCost,
      status,
      receivedAt: new Date().toISOString(),
    };

    this.batches.push(newBatch);

    const movement: StockMovementEntity = {
      movementId: uuidv4(),
      productId: input.productId,
      batchId: newBatch.batchId,
      locationId: newBatch.locationId,
      movementType: 'PURCHASE_RECEIPT',
      quantityDelta: input.quantity,
      balanceAfter: newTotal,
      unitCostSnapshot: input.unitCost,
      referenceDocument: input.supplierInvoice,
      operatorName: input.operatorName,
      notes: `Llegada de mercancía nueva: Lote ${input.batchNumber}`,
      occurredAt: new Date().toISOString(),
    };

    this.movements.push(movement);
    this.refreshProductView(input.productId);

    return { batch: newBatch, movement };
  }

  // Despacho de mercancía (Venta o Salida)
  public dispatchStockFEFO(input: DispatchStockInput): StockMovementEntity[] {
    const product = this.products.find((p) => p.id === input.productId);
    if (!product) throw new Error(`Producto ${input.productId} no encontrado`);

    const availableBatches = this.batches
      .filter((b) => b.productId === input.productId && b.quantityOnHand > 0)
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    const totalAvailable = availableBatches.reduce((acc, b) => acc + b.quantityOnHand, 0);
    if (totalAvailable < input.quantity) {
      throw new Error(`No hay suficiente mercancía en la tienda. Solicitado: ${input.quantity}, Hay en total: ${totalAvailable}`);
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
        notes: input.notes || `Salida por venta de lote ${batch.batchNumber}`,
        occurredAt: new Date().toISOString(),
      };

      this.movements.push(movement);
      generatedMovements.push(movement);
    }

    this.refreshProductView(input.productId);
    return generatedMovements;
  }

  // Registrar Baja por Merma
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
      referenceDocument: 'BAJA-MERMA',
      operatorName,
      notes: reason,
      occurredAt: new Date().toISOString(),
    };

    this.movements.push(movement);
    this.refreshProductView(batch.productId);
    return movement;
  }

  // Actualizar datos de un producto
  public updateProduct(id: string, updates: Partial<SupermarketProductRow>): SupermarketProductRow | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    if (updates.department) {
      this.ensureCategoryExists(updates.department, updates.aisleLocation);
    }

    const current = this.products[index];
    const updated: SupermarketProductRow = {
      ...current,
      ...updates,
      // Aseguramos que id y claves esenciales no se corrompan
      id: current.id,
    };

    // Si cambió el precio o costo, actualizar snapshots en batches activos
    if (updates.unitCost !== undefined) {
      this.batches
        .filter((b) => b.productId === id)
        .forEach((b) => {
          b.unitCost = updates.unitCost!;
        });
    }

    this.products[index] = updated;
    this.refreshProductView(id);
    return this.products[index];
  }

  // Eliminar producto y sus lotes
  public deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    // Remover producto
    this.products.splice(index, 1);
    // Remover sus lotes
    this.batches = this.batches.filter((b) => b.productId !== id);
    return true;
  }

  // === GESTIÓN DE DEPARTAMENTOS Y CATEGORÍAS PERSONALIZABLES ===

  public getCategories(): StoreCategory[] {
    return this.categories.map((cat) => ({
      ...cat,
      productCount: this.products.filter(
        (p) => p.department.trim().toLowerCase() === cat.name.trim().toLowerCase()
      ).length,
    }));
  }

  public ensureCategoryExists(departmentName: string, defaultAisle?: string): StoreCategory {
    const trimmed = departmentName.trim();
    if (!trimmed) return this.categories[0];

    const found = this.categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) return found;

    return this.addCategory({
      name: trimmed,
      code: trimmed.slice(0, 4).toUpperCase(),
      defaultAisle: defaultAisle || 'Pasillo General',
    });
  }

  public addCategory(input: {
    name: string;
    code?: string;
    defaultAisle?: string;
    requiresColdChain?: boolean;
  }): StoreCategory {
    const trimmedName = input.name.trim();
    if (!trimmedName) throw new Error('El nombre de la categoría es obligatorio');

    const existing = this.categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return {
        ...existing,
        productCount: this.products.filter(
          (p) => p.department.trim().toLowerCase() === existing.name.trim().toLowerCase()
        ).length,
      };
    }

    const newCat: StoreCategory = {
      id: uuidv4(),
      name: trimmedName,
      code: input.code?.trim().toUpperCase() || trimmedName.slice(0, 4).toUpperCase(),
      defaultAisle: input.defaultAisle?.trim() || 'Pasillo General',
      requiresColdChain: !!input.requiresColdChain,
    };

    this.categories.push(newCat);
    return { ...newCat, productCount: 0 };
  }

  public updateCategory(
    id: string,
    updates: {
      name?: string;
      code?: string;
      defaultAisle?: string;
      requiresColdChain?: boolean;
    }
  ): StoreCategory | null {
    const catIndex = this.categories.findIndex((c) => c.id === id);
    if (catIndex === -1) return null;

    const oldCat = this.categories[catIndex];
    const newName = updates.name?.trim() || oldCat.name;

    // Si cambió el nombre del departamento, verificar duplicados y actualizarlo en todos los productos asociados
    if (newName.toLowerCase() !== oldCat.name.toLowerCase()) {
      const duplicate = this.categories.find(
        (c) => c.id !== id && c.name.toLowerCase() === newName.toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Ya existe una categoría con el nombre "${newName}"`);
      }
      this.products.forEach((p) => {
        if (p.department.trim().toLowerCase() === oldCat.name.trim().toLowerCase()) {
          p.department = newName;
        }
      });
    }

    this.categories[catIndex] = {
      ...oldCat,
      name: newName,
      code: updates.code ? updates.code.trim().toUpperCase() : oldCat.code,
      defaultAisle: updates.defaultAisle !== undefined ? updates.defaultAisle.trim() : oldCat.defaultAisle,
      requiresColdChain: updates.requiresColdChain !== undefined ? updates.requiresColdChain : oldCat.requiresColdChain,
    };

    return {
      ...this.categories[catIndex],
      productCount: this.products.filter(
        (p) => p.department.trim().toLowerCase() === newName.toLowerCase()
      ).length,
    };
  }

  public deleteCategory(id: string, reassignToDepartment?: string): boolean {
    if (this.categories.length <= 1) {
      return false; // No se puede eliminar la única categoría existente
    }

    const catIndex = this.categories.findIndex((c) => c.id === id);
    if (catIndex === -1) return false;

    const deletedCat = this.categories[catIndex];
    const remaining = this.categories.filter((c) => c.id !== id);

    let targetDept = reassignToDepartment?.trim();
    // Si el destino está vacío o coincide con la categoría que se va a eliminar, usar la primera restante
    if (!targetDept || targetDept.toLowerCase() === deletedCat.name.toLowerCase()) {
      targetDept = remaining[0]?.name || 'General';
    }

    // Reasignar productos que pertenecían a la categoría eliminada
    this.products.forEach((p) => {
      if (p.department.trim().toLowerCase() === deletedCat.name.trim().toLowerCase()) {
        p.department = targetDept;
      }
    });

    this.categories.splice(catIndex, 1);
    return true;
  }
}
