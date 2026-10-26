import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { CreateProductSchema } from '@/lib/validators/supermarket.schema';
import { v4 as uuidv4 } from 'uuid';

const repo = SupermarketRepository.getInstance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');
  const department = searchParams.get('department');

  let list = repo.products;

  if (barcode) {
    list = list.filter((p) => p.barcodeEan13 === barcode || p.sku === barcode || p.pluCode === barcode);
  }

  if (department && department !== 'ALL') {
    list = list.filter((p) => p.department === department);
  }

  return NextResponse.json({
    success: true,
    count: list.length,
    data: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const productId = uuidv4();
    const sku = body.sku?.trim() || `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcodeEan13 = body.barcodeEan13?.trim() || `${Math.floor(7500000000000 + Math.random() * 999999999)}`;
    const name = body.name?.trim();
    const brand = body.brand?.trim() || 'Genérico';
    const department = body.department || 'Abarrotes y Despensa';
    const aisleLocation = body.aisleLocation?.trim() || 'Estante Central';
    const baseUom = body.baseUom || 'Pza';
    const storageTemp = body.storageTemp || body.storageCondition || 'Ambiente (Seco)';
    const unitCost = Number(body.unitCost) || 0;
    const salePrice = Number(body.salePrice) || 0;
    const minStockAlert = Number(body.minStockAlert) || 5;
    const initialQuantity = Number(body.initialQuantity) || 0;
    const initialBatch = body.initialBatch?.trim() || (initialQuantity > 0 ? `LOT-${new Date().getFullYear()}-01` : 'S/L');
    const expirationDate = body.expirationDate || (initialQuantity > 0 ? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) : 'Sin Lote');

    if (!name) {
      return NextResponse.json({ success: false, error: 'El nombre del producto es obligatorio' }, { status: 400 });
    }

    if (salePrice <= 0) {
      return NextResponse.json({ success: false, error: 'El precio de venta debe ser mayor a 0' }, { status: 400 });
    }

    let initialStatus: 'GOOD' | 'LOW_STOCK' | 'EXPIRED' = 'LOW_STOCK';
    let daysToExpire: number | null = null;

    if (initialQuantity > 0 && expirationDate !== 'Sin Lote') {
      const health = SupermarketRepository.calculateHealthStatus(expirationDate, initialQuantity, minStockAlert);
      initialStatus = health.status;
      daysToExpire = health.daysToExpire;
    }

    const newProduct = {
      id: productId,
      sku,
      barcodeEan13,
      pluCode: body.pluCode?.trim() || undefined,
      name,
      brand,
      department,
      aisleLocation,
      batchNumber: initialBatch,
      expirationDate,
      daysToExpire,
      storageTemp,
      shelfStock: initialQuantity,
      backroomStock: 0,
      stockQuantity: initialQuantity,
      minStockAlert,
      baseUom,
      packEquivalence: body.packEquivalence || `1 ${baseUom}`,
      unitCost,
      salePrice,
      status: initialStatus,
    };

    repo.ensureCategoryExists(department, aisleLocation);
    repo.products.unshift(newProduct);

    // Si viene cantidad inicial, creamos también el lote y el movimiento en el kardex
    if (initialQuantity > 0 && expirationDate !== 'Sin Lote') {
      const batchId = uuidv4();
      repo.batches.push({
        batchId,
        productId,
        locationId: 'loc-main',
        locationName: aisleLocation,
        batchNumber: initialBatch,
        expirationDate,
        quantityOnHand: initialQuantity,
        unitCost,
        status: initialStatus,
        receivedAt: new Date().toISOString(),
      });

      repo.movements.push({
        movementId: uuidv4(),
        productId,
        batchId,
        locationId: 'loc-main',
        movementType: 'PURCHASE_RECEIPT',
        quantityDelta: initialQuantity,
        balanceAfter: initialQuantity,
        unitCostSnapshot: unitCost,
        referenceDocument: 'ALTA-INICIAL',
        operatorName: body.operatorName || 'Encargado de Tienda',
        notes: `Alta inicial de producto: "${name}"`,
        occurredAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar el producto' },
      { status: 400 }
    );
  }
}
