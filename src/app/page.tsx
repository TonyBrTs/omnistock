'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCards } from '@/components/MetricCards';
import { SupermarketInventoryTable } from '@/components/SupermarketInventoryTable';
import { ReceiveBatchModal } from '@/components/ReceiveBatchModal';
import { POSSimulatorModal } from '@/components/POSSimulatorModal';
import { KardexAuditModal } from '@/components/KardexAuditModal';
import { PriceTagGeneratorModal } from '@/components/PriceTagGeneratorModal';
import { AuditReportModal } from '@/components/AuditReportModal';
import { ShrinkageFormModal } from '@/components/ShrinkageFormModal';
import { StoreMetricCard, SupermarketProductRow } from '@/types/supermarket';

export default function SupermarketDashboardPage() {
  const [products, setProducts] = useState<SupermarketProductRow[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
  const [isPriceTagsModalOpen, setIsPriceTagsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isShrinkageModalOpen, setIsShrinkageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar productos del inventario
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Error al cargar la tienda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tarjetas principales 100% de inventario
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW_STOCK').length;
  const expiredCount = products.filter((p) => p.status === 'EXPIRED').length;
  const optimalCount = products.filter((p) => p.status === 'GOOD').length;

  const dynamicMetrics: StoreMetricCard[] = [
    {
      id: 'm-skus',
      title: 'Total de Mercancía',
      subtitle: 'En tienda y bodega',
      value: loading ? '...' : `${products.length} productos (${totalStockCount} pzas)`,
      badgeText: 'En Tienda',
      variant: 'good',
      icon: 'barcode',
    },
    {
      id: 'm-optimal',
      title: 'Inventario Disponible',
      subtitle: 'Listos para la venta',
      value: loading ? '...' : `${optimalCount} en buen estado`,
      badgeText: 'Al 100%',
      variant: 'good',
      icon: 'barcode',
    },
    {
      id: 'm-low',
      title: 'Queda Muy Poco',
      subtitle: 'Hay que surtir el estante',
      value: loading ? '...' : `${lowStockCount} por acabarse`,
      badgeText: 'Por Surtir',
      variant: 'warning',
      icon: 'low-stock',
    },
    {
      id: 'm-fefo',
      title: 'Productos Vencidos',
      subtitle: 'Bloqueados en caja',
      value: loading ? '...' : `${expiredCount} vencidos`,
      badgeText: expiredCount > 0 ? 'Para Tirar' : 'Sin Vencidos',
      variant: expiredCount > 0 ? 'danger' : 'good',
      icon: 'expiry-alert',
    },
  ];

  const handleTableAction = async (
    action: 'REPLENISH_AISLE' | 'MARK_MERMA' | 'ADJUST_STOCK',
    product: SupermarketProductRow
  ) => {
    if (action === 'REPLENISH_AISLE') {
      try {
        const res = await fetch('/api/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: 12,
            movementType: 'SHELF_REPLENISHMENT',
            operatorName: 'Encargado de Tienda',
            referenceDocument: 'SURTIDO-ESTANTE',
            notes: `Se pusieron 12 ${product.baseUom} más en el estante de "${product.name}".`,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setToastMessage(`Listo: Se pusieron 12 piezas más en el estante de "${product.name}".`);
          fetchProducts();
        } else {
          setToastMessage(`No se pudo: ${JSON.stringify(data.error)}`);
        }
      } catch (err: any) {
        setToastMessage(`Error: ${err.message}`);
      }
    } else if (action === 'MARK_MERMA') {
      setIsShrinkageModalOpen(true);
    } else if (action === 'ADJUST_STOCK') {
      setToastMessage(`Se anotó el conteo a mano para "${product.name}".`);
    }
  };

  return (
    <AppLayout
      storeBranchName="Sucursal Centro"
      onQuickReceiveStock={() => setIsReceiveModalOpen(true)}
      onOpenPOSSimulator={() => setIsPOSModalOpen(true)}
      onOpenKardex={() => setIsKardexModalOpen(true)}
      onOpenPriceTags={() => setIsPriceTagsModalOpen(true)}
      onOpenAuditReport={() => setIsAuditModalOpen(true)}
      onOpenShrinkage={() => setIsShrinkageModalOpen(true)}
    >
      {/* Mensaje de Confirmación */}
      {toastMessage && (
        <div className="bg-[#FFFFFF] border border-[#008767] rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-4 animate-in fade-in w-full overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008767] shrink-0" />
            <p className="text-xs font-bold text-[#0F172A] truncate">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="cursor-pointer text-xs font-bold text-[#64748B] hover:text-[#0F172A] shrink-0"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* 4 Tarjetas de Métricas de Inventario */}
      <MetricCards metrics={dynamicMetrics} />

      {/* Tabla con los Productos */}
      <SupermarketInventoryTable
        products={products}
        onActionSelect={handleTableAction}
      />

      {/* Modales del Gestor de Inventario */}
      <ReceiveBatchModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        products={products}
        onBatchReceived={(msg) => {
          setToastMessage(msg);
          fetchProducts();
        }}
      />

      <POSSimulatorModal
        isOpen={isPOSModalOpen}
        onClose={() => setIsPOSModalOpen(false)}
        products={products}
        onSaleCompleted={(msg) => {
          setToastMessage(msg);
          fetchProducts();
        }}
      />

      <KardexAuditModal
        isOpen={isKardexModalOpen}
        onClose={() => setIsKardexModalOpen(false)}
      />

      <PriceTagGeneratorModal
        isOpen={isPriceTagsModalOpen}
        onClose={() => setIsPriceTagsModalOpen(false)}
        products={products}
      />

      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <ShrinkageFormModal
        isOpen={isShrinkageModalOpen}
        onClose={() => setIsShrinkageModalOpen(false)}
        products={products}
        onShrinkageRecorded={(msg) => {
          setToastMessage(msg);
          fetchProducts();
        }}
      />
    </AppLayout>
  );
}
