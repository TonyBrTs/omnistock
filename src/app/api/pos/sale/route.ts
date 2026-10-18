import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { z } from 'zod';

const repo = SupermarketRepository.getInstance();

const POSSaleSchema = z.object({
  barcode: z.string().min(1, 'El código de barras o PLU es requerido'),
  quantity: z.number().positive('La cantidad a vender debe ser mayor a 0'),
  cashierName: z.string().min(2, 'El nombre del cajero es requerido'),
  registerNo: z.string().min(1, 'El número de caja es requerido'),
  ticketFolio: z.string().min(1, 'El folio del ticket es requerido'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = POSSaleSchema.parse(body);

    // 1. Buscar producto por EAN-13, PLU o SKU
    const product = repo.products.find(
      (p) =>
        p.barcodeEan13 === validated.barcode ||
        p.pluCode === validated.barcode ||
        p.sku === validated.barcode
    );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'PRODUCT_NOT_FOUND',
          message: `Producto con código "${validated.barcode}" no registrado en catálogo.`,
        },
        { status: 404 }
      );
    }

    // 2. Verificar lotes activos ordenados por FEFO
    const activeBatches = repo.batches
      .filter((b) => b.productId === product.id && b.quantityOnHand > 0)
      .sort(
        (a, b) =>
          new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      );

    if (activeBatches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'OUT_OF_STOCK',
          message: `Sin stock disponible para "${product.name}".`,
        },
        { status: 409 }
      );
    }

    // 3. Regla de Oro FEFO: Validar si el lote principal está caducado
    const leadingBatch = activeBatches[0];
    const { status: batchStatus, daysToExpire } =
      SupermarketRepository.calculateHealthStatus(
        leadingBatch.expirationDate,
        leadingBatch.quantityOnHand,
        product.minStockAlert
      );

    if (batchStatus === 'EXPIRED') {
      // Bloqueo preventivo en POS
      leadingBatch.status = 'EXPIRED';
      return NextResponse.json(
        {
          success: false,
          errorCode: 'POS_EXPIRY_BLOCK',
          message: `VENTA BLOQUEADA: El lote más próximo (${leadingBatch.batchNumber}) de "${product.name}" venció hace ${Math.abs(
            daysToExpire
          )} días (${leadingBatch.expirationDate}). Debe ser retirado a merma antes de continuar.`,
          batchNumber: leadingBatch.batchNumber,
          expirationDate: leadingBatch.expirationDate,
        },
        { status: 422 }
      );
    }

    // 4. Despacho FEFO transaccional
    const movements = repo.dispatchStockFEFO({
      productId: product.id,
      quantity: validated.quantity,
      movementType: 'POS_SALE',
      operatorName: `${validated.cashierName} (Caja #${validated.registerNo})`,
      referenceDocument: validated.ticketFolio,
      notes: `Venta POS en caja #${validated.registerNo} - Ticket ${validated.ticketFolio}`,
    });

    const subtotal = validated.quantity * product.salePrice;
    const tax = subtotal * (0.16); // IVA 16%
    const total = subtotal + tax;

    return NextResponse.json(
      {
        success: true,
        message: `Venta registrada con éxito mediante despacho FEFO del lote ${movements[0]?.batchId ? leadingBatch.batchNumber : 'N/A'}.`,
        saleDetails: {
          productName: product.name,
          barcode: product.barcodeEan13,
          quantitySold: validated.quantity,
          unitPrice: product.salePrice,
          totalAmount: total,
          ticketFolio: validated.ticketFolio,
          dispatchedBatches: movements.map((m) => ({
            batchId: m.batchId,
            quantityDeducted: Math.abs(m.quantityDelta),
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        error: error.errors || error.message,
      },
      { status: 400 }
    );
  }
}
