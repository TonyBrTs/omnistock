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
    const validated = CreateProductSchema.parse(body);

    const newProduct = {
      id: uuidv4(),
      sku: validated.sku,
      barcodeEan13: validated.barcodeEan13,
      pluCode: validated.pluCode,
      name: validated.name,
      brand: validated.brand,
      department: validated.department,
      aisleLocation: 'Bodega General',
      batchNumber: 'S/L',
      expirationDate: 'No Registrada',
      daysToExpire: null,
      storageTemp: validated.storageCondition,
      stockQuantity: 0,
      minStockAlert: validated.minStockAlert,
      baseUom: validated.baseUom,
      packEquivalence: `${validated.purchasePackLabel} (${validated.unitsPerPack} ${validated.baseUom})`,
      unitCost: validated.unitCost,
      salePrice: validated.salePrice,
      status: 'LOW_STOCK' as const,
    };

    repo.products.push(newProduct);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message },
      { status: 400 }
    );
  }
}
