import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';

const repo = SupermarketRepository.getInstance();

export async function GET() {
  const products = repo.products;
  const batches = repo.batches;
  const movements = repo.movements;

  const totalPhysicalStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalValuationCost = products.reduce((acc, p) => acc + p.stockQuantity * p.unitCost, 0);
  const totalValuationSale = products.reduce((acc, p) => acc + p.stockQuantity * p.salePrice, 0);
  const expectedProfit = totalValuationSale - totalValuationCost;

  const activeBatchesCount = batches.filter((b) => b.quantityOnHand > 0).length;
  const expiredBatches = batches.filter((b) => b.status === 'EXPIRED');
  const lowStockBatches = batches.filter((b) => b.status === 'LOW_STOCK');

  const now = new Date().toISOString();

  // Generador de reporte CSV estructurado
  const csvRows: string[] = [
    'REPORTE OFICIAL DE VALUACION Y AUDITORIA FEFO DE INVENTARIO',
    `Fecha de Emision,${now}`,
    `Total SKUs,${products.length}`,
    `Total Unidades Fisicas,${totalPhysicalStock}`,
    `Valuacion Costo Total,$${totalValuationCost.toFixed(2)}`,
    `Valuacion Venta Total,$${totalValuationSale.toFixed(2)}`,
    `Margen Bruto Estimado,$${expectedProfit.toFixed(2)}`,
    '',
    'SKU,Codigo EAN-13,PLU,Nombre Producto,Departamento,Pasillo,Lote FEFO,Fecha Caducidad,Dias Restantes,Stock,UOM,Costo Unit.,Precio Venta,Estado Salud',
  ];

  products.forEach((p) => {
    csvRows.push(
      [
        p.sku,
        p.barcodeEan13,
        p.pluCode || 'N/A',
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.department}"`,
        `"${p.aisleLocation}"`,
        p.batchNumber,
        p.expirationDate,
        p.daysToExpire !== null ? p.daysToExpire : 'N/A',
        p.stockQuantity,
        p.baseUom,
        p.unitCost.toFixed(2),
        p.salePrice.toFixed(2),
        p.status,
      ].join(',')
    );
  });

  const csvContent = csvRows.join('\n');

  return NextResponse.json({
    success: true,
    generatedAt: now,
    summary: {
      totalSkus: products.length,
      totalUnits: totalPhysicalStock,
      valuationCost: totalValuationCost,
      valuationSale: totalValuationSale,
      expectedProfit,
      activeBatchesCount,
      expiredBatchesCount: expiredBatches.length,
      lowStockBatchesCount: lowStockBatches.length,
      totalLedgerTransactions: movements.length,
    },
    csvDownloadPayload: csvContent,
  });
}
