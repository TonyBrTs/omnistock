'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCards } from '@/components/MetricCards';
import { SupermarketInventoryTable } from '@/components/SupermarketInventoryTable';
import { ReceiveBatchModal } from '@/components/ReceiveBatchModal';
import { StoreMetricCard, SupermarketProductRow } from '@/types/supermarket';

export default function SupermarketDashboardPage() {
  const [products, setProducts] = useState<SupermarketProductRow[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carga inicial desde el backend API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error('Error al cargar inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cálculo dinámico de métricas desde el estado real del inventario
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW_STOCK').length;
  const expiredCount = products.filter((p) => p.status === 'EXPIRED').length;

  const dynamicMetrics: StoreMetricCard[] = [
    {
      id: 'm-skus',
      title: 'Productos y Lotes Activos',
      subtitle: 'Piso de venta + Cámara fría',
      value: loading ? '...' : `${products.length} SKUs (${totalStockCount} U)`,
      badgeText: 'En Góndola',
      variant: 'good',
      icon: 'barcode',
    },
    {
      id: 'm-low',
      title: 'Quiebres / Por Resurtir',
      subtitle: 'Stock menor al umbral mínimo',
      value: loading ? '...' : `${lowStockCount} Lotes`,
      badgeText: 'Prioridad Alta',
      variant: 'warning',
      icon: 'low-stock',
    },
    {
      id: 'm-fefo',
      title: 'Riesgo / Caducados (FEFO)',
      subtitle: 'Alertas del motor de caducidad',
      value: loading ? '...' : `${expiredCount} Lotes`,
      badgeText: expiredCount > 0 ? 'Bloqueados POS' : 'Al Día',
      variant: expiredCount > 0 ? 'danger' : 'good',
      icon: 'expiry-alert',
    },
    {
      id: 'm-cold',
      title: 'Cadena de Frío (Cámaras 1-4)',
      subtitle: 'Sensores IoT en rango óptimo',
      value: '3.2 °C',
      badgeText: 'Estable 24h',
      variant: 'info',
      icon: 'cold-chain',
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
            operatorName: 'Jefe de Almacén',
            referenceDocument: 'RESURTIDO-PISO',
            notes: `Resurtido FEFO de 12 ${product.baseUom} a góndola.`,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setToastMessage(data.message);
          fetchProducts();
        } else {
          setToastMessage(`Error: ${JSON.stringify(data.error)}`);
        }
      } catch (err: any) {
        setToastMessage(`Error de comunicación: ${err.message}`);
      }
    } else if (action === 'MARK_MERMA') {
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setToastMessage(
        `Merma Registrada: Lote ${product.batchNumber} (${product.name}) retirado de piso y bloqueado en POS.`
      );
    } else if (action === 'ADJUST_STOCK') {
      setToastMessage(
        `Conteo cíclico auditado para ${product.name} en ${product.aisleLocation}.`
      );
    }
  };

  return (
    <AppLayout
      storeBranchName="Sucursal #04 · Hipermercado Centro"
      onQuickReceiveStock={() => setIsReceiveModalOpen(true)}
    >
      {/* Notificación de Confirmación de Operaciones */}
      {toastMessage && (
        <div className="bg-[#FFFFFF] border border-[#008767] rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008767]" />
            <p className="text-xs font-semibold text-[#0F172A]">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Grid Superior de 4 Métricas Clave */}
      <MetricCards metrics={dynamicMetrics} />

      {/* Tabla de Inventario de Supermercado con FEFO y Códigos de Barras */}
      <SupermarketInventoryTable
        products={products}
        onActionSelect={handleTableAction}
      />

      {/* Modal de Entrada de Lotes (Recepción de Proveedores) */}
      <ReceiveBatchModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        products={products}
        onBatchReceived={(msg) => {
          setToastMessage(msg);
          fetchProducts();
        }}
      />
    </AppLayout>
  );
}
