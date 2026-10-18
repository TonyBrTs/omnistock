'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCards } from '@/components/MetricCards';
import { SupermarketInventoryTable } from '@/components/SupermarketInventoryTable';
import { StoreMetricCard, SupermarketProductRow } from '@/types/supermarket';

const STORE_METRICS: StoreMetricCard[] = [
  {
    id: 'm-skus',
    title: 'Productos y Lotes Activos',
    subtitle: 'Piso de venta + Cámara fría',
    value: '14,820',
    badgeText: '98.9% en Góndola',
    variant: 'good',
    icon: 'barcode',
  },
  {
    id: 'm-low',
    title: 'Quiebres / Por Resurtir',
    subtitle: 'Stock menor al mínimo en pasillo',
    value: '23',
    badgeText: 'Prioridad Alta',
    variant: 'warning',
    icon: 'low-stock',
  },
  {
    id: 'm-fefo',
    title: 'Riesgo de Caducidad (< 7 días)',
    subtitle: 'Alertas del motor FEFO',
    value: '11 Lotes',
    badgeText: '3 Bloqueados POS',
    variant: 'danger',
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

const INITIAL_SUPERMARKET_STOCK: SupermarketProductRow[] = [
  {
    id: 'prod-101',
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
  },
  {
    id: 'prod-102',
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
  },
  {
    id: 'prod-103',
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
  },
  {
    id: 'prod-104',
    sku: 'FRU-AGU-01',
    barcodeEan13: '2004022000001',
    pluCode: '4225',
    name: 'Aguacate Hass Selección Extra (Pesable)',
    brand: 'Huerta Michoacán',
    department: 'Frutas y Verduras',
    aisleLocation: 'Isla Central Frutas #1',
    batchNumber: 'LOT-SEM42-MX',
    expirationDate: '2026-10-26',
    daysToExpire: 8,
    storageTemp: 'Ambiente (Seco)',
    stockQuantity: 92.5,
    minStockAlert: 25,
    baseUom: 'Kg',
    packEquivalence: '1 Reja = 18 Kg prom.',
    unitCost: 48.0,
    salePrice: 74.9,
    status: 'GOOD',
  },
  {
    id: 'prod-105',
    sku: 'ABA-ACE-02',
    barcodeEan13: '7501005109924',
    name: 'Aceite de Oliva Extra Virgen Prensa Fría 750ml',
    brand: 'Carbonell',
    department: 'Abarrotes y Despensa',
    aisleLocation: 'Pasillo 06 · Nivel 3',
    batchNumber: 'LOT-2026-ESP',
    expirationDate: '2027-08-15',
    daysToExpire: 301,
    storageTemp: 'Ambiente (Seco)',
    stockQuantity: 9,
    minStockAlert: 12,
    baseUom: 'Pza',
    packEquivalence: '1 Caja = 12 Botellas',
    unitCost: 145.0,
    salePrice: 198.0,
    status: 'LOW_STOCK',
  },
  {
    id: 'prod-106',
    sku: 'BEB-REF-12',
    barcodeEan13: '7501055311445',
    name: 'Agua Mineral Natural Gasificada 600ml',
    brand: 'Topo Chico',
    department: 'Bebidas y Licores',
    aisleLocation: 'Pasillo 09 · Cabecera Norte',
    batchNumber: 'LOT-2610-MTY',
    expirationDate: '2027-04-30',
    daysToExpire: 194,
    storageTemp: 'Ambiente (Seco)',
    stockQuantity: 240,
    minStockAlert: 48,
    baseUom: 'Pza',
    packEquivalence: '1 Paquete = 24 Botellas',
    unitCost: 13.2,
    salePrice: 19.5,
    status: 'GOOD',
  },
];

export default function SupermarketDashboardPage() {
  const [products, setProducts] = useState<SupermarketProductRow[]>(
    INITIAL_SUPERMARKET_STOCK
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTableAction = (
    action: 'REPLENISH_AISLE' | 'MARK_MERMA' | 'ADJUST_STOCK',
    product: SupermarketProductRow
  ) => {
    if (action === 'REPLENISH_AISLE') {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stockQuantity: item.stockQuantity + 24,
                status: 'GOOD',
              }
            : item
        )
      );
      setToastMessage(
        `FEFO: Se resurtieron +24 ${product.baseUom} al lote ${product.batchNumber} de "${product.name}".`
      );
    } else if (action === 'MARK_MERMA') {
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setToastMessage(
        `Merma Registrada: Lote ${product.batchNumber} (${product.name}) retirado de piso y bloqueado en POS.`
      );
    } else if (action === 'ADJUST_STOCK') {
      setToastMessage(
        `Conteo cíclico iniciado para ${product.name} en ${product.aisleLocation}.`
      );
    }
  };

  return (
    <AppLayout
      storeBranchName="Sucursal #04 · Hipermercado Centro"
      onQuickReceiveStock={() =>
        setToastMessage(
          'Escáner de recepción activado: Listo para leer factura y lotes FEFO de proveedor.'
        )
      }
    >
      {/* Banner Informativo de Eventos */}
      {toastMessage && (
        <div className="bg-[#FFFFFF] border border-[#008767] rounded-2xl px-5 py-3.5 shadow-sm flex items-center justify-between gap-4">
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

      {/* Grid Superior de 4 Tarjetas de Métricas */}
      <MetricCards metrics={STORE_METRICS} />

      {/* Tabla Principal de Inventario FEFO del Supermercado */}
      <SupermarketInventoryTable
        products={products}
        onActionSelect={handleTableAction}
      />
    </AppLayout>
  );
}
