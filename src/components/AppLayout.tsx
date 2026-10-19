'use client';

import React, { useState } from 'react';
import {
  Boxes,
  PackagePlus,
  Trash2,
  ShoppingCart,
  Tag,
  FileSpreadsheet,
  ThermometerSnowflake,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Store,
  UserCheck,
} from 'lucide-react';

interface AppLayoutProps {
  storeBranchName: string;
  onQuickReceiveStock?: () => void;
  onOpenPOSSimulator?: () => void;
  onOpenKardex?: () => void;
  onOpenPriceTags?: () => void;
  onOpenAuditReport?: () => void;
  onOpenColdChain?: () => void;
  onOpenShrinkage?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  storeBranchName,
  onQuickReceiveStock,
  onOpenPOSSimulator,
  onOpenKardex,
  onOpenPriceTags,
  onOpenAuditReport,
  onOpenColdChain,
  onOpenShrinkage,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-[#0F172A] font-sans antialiased">
      {/* Barra Lateral Institucional (#0F172A) */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-[#0F172A] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 select-none sticky top-0 h-screen`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Cabecera del Sidebar con Logo y Botón de Colapso */}
          <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[#008767] flex items-center justify-center font-extrabold text-white shadow-sm shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="leading-tight overflow-hidden">
                  <span className="font-bold text-base tracking-tight block text-white truncate">
                    OmniStock
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider block truncate">
                    Inventario de Tienda
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
              aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
              className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Grupo 1: ERP & Inventario */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inventario & Lotes
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    title="Catálogo & Lotes FEFO"
                    className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#008767] text-white shadow-xs transition-all hover:brightness-105"
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>Catálogo & FEFO</span>}
                    </div>
                    {!collapsed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20">
                        En Vivo
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onQuickReceiveStock}
                    title="Recepción de Mercancía / Proveedor"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!collapsed && <span>Recibir Lote</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenShrinkage}
                    title="Bajas & Mermas por Caducidad"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    {!collapsed && <span>Baja por Merma</span>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Grupo 2: Punto de Venta & Góndola */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Operación de Piso & POS
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={onOpenPOSSimulator}
                    title="Simulador de Cobro en Caja POS"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 text-blue-400 shrink-0" />
                    {!collapsed && <span>Caja POS (FEFO)</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenPriceTags}
                    title="Cenefas y Etiquetas de Precio"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                    {!collapsed && <span>Cenefas de Góndola</span>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Grupo 3: Auditoría & Telemetría */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Auditoría & Sensores
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={onOpenKardex}
                    title="Kardex de Movimientos (Ledger)"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                    {!collapsed && <span>Kardex / Historial</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenColdChain}
                    title="Telemetría de Cadena de Frío IoT"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <ThermometerSnowflake className="w-4 h-4 text-cyan-400 shrink-0" />
                    {!collapsed && <span>Cadena de Frío IoT</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAuditReport}
                    title="Valuación Financiera y Descarga CSV"
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    {!collapsed && <span>Valuación / CSV</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Pie del Sidebar con Estado del Sistema */}
          <div className="p-3 border-t border-slate-800/80 shrink-0">
            <div className="p-3 rounded-2xl bg-[#1E293B] flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Cajas & Sensores</p>
                  <p className="text-[11px] text-slate-400 truncate">100% En Línea</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Superior */}
        <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 md:px-8 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Control de Inventario y Perecederos (FEFO)
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#DCFCE7] text-[#166534]">
                {storeBranchName}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Control en tiempo real de lotes por caducar, resurtido a góndola y bloqueo preventivo en cajas registradoras.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenColdChain}
              className="cursor-pointer px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <ThermometerSnowflake className="w-3.5 h-3.5" />
              <span>Sensores Frío</span>
            </button>

            <button
              type="button"
              onClick={onOpenPriceTags}
              className="cursor-pointer px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Cenefas</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuditReport}
              className="cursor-pointer px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008767] text-xs font-semibold tracking-wide border border-emerald-200 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Valuación CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenPOSSimulator}
              className="cursor-pointer px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide border border-indigo-200 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cobro POS</span>
            </button>

            <button
              type="button"
              onClick={onOpenKardex}
              className="cursor-pointer px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold tracking-wide border border-purple-200 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Kardex</span>
            </button>

            <button
              type="button"
              onClick={onQuickReceiveStock}
              className="cursor-pointer px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-bold tracking-wide shadow-sm transition-all flex items-center gap-1.5 hover:shadow-md active:scale-95"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Recibir Lote</span>
            </button>

            {/* Usuario Jefe de Almacén */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
              <div className="w-9 h-9 rounded-xl bg-[#0D5C75] text-white flex items-center justify-center font-bold shadow-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="hidden xl:block leading-tight">
                <p className="text-xs font-bold text-[#0F172A]">Jefe de Almacén</p>
                <p className="text-[10px] text-[#64748B]">Sucursal #04 Centro</p>
              </div>
            </div>
          </div>
        </header>

        {/* Cuerpo Principal */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
