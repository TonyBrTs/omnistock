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
import { CreateProductModal } from '@/components/CreateProductModal';
import { EditProductModal } from '@/components/EditProductModal';
import { DeleteProductModal } from '@/components/DeleteProductModal';
import { ManageCategoriesModal } from '@/components/ManageCategoriesModal';
import { StoreMetricCard, SupermarketProductRow } from '@/types/supermarket';

export default function SupermarketDashboardPage() {
  const [products, setProducts] = useState<SupermarketProductRow[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
  const [isPriceTagsModalOpen, setIsPriceTagsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isShrinkageModalOpen, setIsShrinkageModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<SupermarketProductRow | null>(null);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<SupermarketProductRow | null>(null);
  const [selectedProductForShrinkage, setSelectedProductForShrinkage] = useState<SupermarketProductRow | null>(null);
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

  // Cargar categorías y departamentos
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableDepartments(json.data.map((c: any) => c.name));
      }
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Tarjetas principales de inventario
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW_STOCK').length;
  const expiredCount = products.filter((p) => p.status === 'EXPIRED').length;
  const optimalCount = products.filter((p) => p.status === 'GOOD').length;

  const dynamicMetrics: StoreMetricCard[] = [
    {
      id: 'm-skus',
      title: 'Total en Catálogo',
      subtitle: 'Existencias globales',
      value: loading ? '...' : `${products.length} productos (${totalStockCount} pzas)`,
      badgeText: 'Catálogo',
      variant: 'good',
      icon: 'barcode',
    },
    {
      id: 'm-optimal',
      title: 'Stock Disponible',
      subtitle: 'Existencias vigentes para venta',
      value: loading ? '...' : `${optimalCount} artículos`,
      badgeText: 'Vigente',
      variant: 'good',
      icon: 'barcode',
    },
    {
      id: 'm-low',
      title: 'Stock Bajo',
      subtitle: 'Próximos a agotarse',
      value: loading ? '...' : `${lowStockCount} artículos`,
      badgeText: 'Atención',
      variant: 'warning',
      icon: 'low-stock',
    },
    {
      id: 'm-fefo',
      title: 'Productos Vencidos',
      subtitle: 'Lotes no aptos para venta',
      value: loading ? '...' : `${expiredCount} artículos`,
      badgeText: expiredCount > 0 ? 'Por retirar' : 'En regla',
      variant: expiredCount > 0 ? 'danger' : 'good',
      icon: 'expiry-alert',
    },
  ];

  const handleTableAction = async (
    action: 'MARK_MERMA' | 'ADJUST_STOCK',
    product: SupermarketProductRow
  ) => {
    if (action === 'MARK_MERMA') {
      setSelectedProductForShrinkage(product);
      setIsShrinkageModalOpen(true);
    } else if (action === 'ADJUST_STOCK') {
      setToastMessage(`Conteo físico registrado para "${product.name}".`);
    }
  };

  return (
    <AppLayout
      storeBranchName="Sucursal Centro"
      onOpenCreateProduct={() => setIsCreateProductModalOpen(true)}
      onOpenCategories={() => setIsCategoriesModalOpen(true)}
      onQuickReceiveStock={() => setIsReceiveModalOpen(true)}
      onOpenPOSSimulator={() => setIsPOSModalOpen(true)}
      onOpenKardex={() => setIsKardexModalOpen(true)}
      onOpenPriceTags={() => setIsPriceTagsModalOpen(true)}
      onOpenAuditReport={() => setIsAuditModalOpen(true)}
      onOpenShrinkage={() => {
        setSelectedProductForShrinkage(null);
        setIsShrinkageModalOpen(true);
      }}
    >
      {/* Mensaje de Confirmación */}
      {toastMessage && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#008767] dark:border-emerald-500 rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-4 animate-in fade-in w-full overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008767] dark:bg-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="cursor-pointer text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white shrink-0"
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
        availableDepartments={availableDepartments}
        onOpenCategories={() => setIsCategoriesModalOpen(true)}
        onActionSelect={handleTableAction}
        onCreateProduct={() => setIsCreateProductModalOpen(true)}
        onEditProduct={(product) => {
          setSelectedProductForEdit(product);
          setIsEditProductModalOpen(true);
        }}
        onDeleteProduct={(product) => {
          setSelectedProductForDelete(product);
          setIsDeleteProductModalOpen(true);
        }}
      />

      {/* Modales del Gestor de Inventario */}
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        onProductCreated={(msg) => {
          setToastMessage(msg);
          fetchProducts();
          fetchCategories();
        }}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setSelectedProductForEdit(null);
        }}
        product={selectedProductForEdit}
        onProductUpdated={(msg) => {
          setToastMessage(msg);
          fetchProducts();
          fetchCategories();
        }}
      />

      <DeleteProductModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => {
          setIsDeleteProductModalOpen(false);
          setSelectedProductForDelete(null);
        }}
        product={selectedProductForDelete}
        onProductDeleted={(msg) => {
          setToastMessage(msg);
          fetchProducts();
          fetchCategories();
        }}
      />

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onCategoriesChanged={() => {
          fetchProducts();
          fetchCategories();
        }}
      />

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
        onClose={() => {
          setIsShrinkageModalOpen(false);
          setSelectedProductForShrinkage(null);
        }}
        products={products}
        initialBatchNumber={selectedProductForShrinkage?.batchNumber}
        onShrinkageRecorded={(msg) => {
          setToastMessage(msg);
          fetchProducts();
        }}
      />
    </AppLayout>
  );
}
