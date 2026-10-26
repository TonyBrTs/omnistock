'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Boxes,
  PackagePlus,
  Trash2,
  ShoppingCart,
  Tag,
  FileSpreadsheet,
  History,
  ChevronLeft,
  ChevronRight,
  Store,
  UserCheck,
  Sun,
  Moon,
  PlusCircle,
} from 'lucide-react';

interface AppLayoutProps {
  storeBranchName: string;
  onOpenCreateProduct?: () => void;
  onQuickReceiveStock?: () => void;
  onOpenPOSSimulator?: () => void;
  onOpenKardex?: () => void;
  onOpenPriceTags?: () => void;
  onOpenAuditReport?: () => void;
  onOpenShrinkage?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  storeBranchName,
  onOpenCreateProduct,
  onQuickReceiveStock,
  onOpenPOSSimulator,
  onOpenKardex,
  onOpenPriceTags,
  onOpenAuditReport,
  onOpenShrinkage,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-[#F4F6F9] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] font-sans antialiased overflow-x-hidden transition-colors duration-200">
      {/* Barra Lateral Izquierda */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } shrink-0 bg-[#0F172A] text-white flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 select-none sticky top-0 h-screen z-30`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Cabecera del Menú */}
          {collapsed ? (
            <div className="h-20 flex items-center justify-center border-b border-slate-800/80 shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                title="Abrir menú"
                aria-label="Abrir menú"
                className="cursor-pointer p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden cursor-default min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#008767] flex items-center justify-center font-extrabold text-white shadow-sm shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight overflow-hidden truncate">
                  <span className="font-bold text-base tracking-tight block text-white truncate">
                    OmniStock
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider block truncate">
                    Inventario de Tienda
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Cerrar menú"
                aria-label="Cerrar menú"
                className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Opciones del Menú */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Sección: Inventario */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inventario
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    title="Ver catálogo y productos"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-semibold bg-[#008767] text-white shadow-xs transition-all hover:brightness-105`}
                  >
                    <Boxes className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">Productos</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenCreateProduct}
                    title="Dar de alta un producto en el catálogo"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    {!collapsed && <span className="truncate">Nuevo Producto</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onQuickReceiveStock}
                    title="Registrar entrada de mercancía"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <PackagePlus className="w-5 h-5 text-emerald-400 shrink-0" />
                    {!collapsed && <span className="truncate">Meter Mercancía</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenShrinkage}
                    title="Dar de baja producto dañado o vencido"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
                    {!collapsed && <span className="truncate">Registrar Merma</span>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Sección: Operación */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Operación
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={onOpenPOSSimulator}
                    title="Cobrar en caja registradora"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <ShoppingCart className="w-5 h-5 text-blue-400 shrink-0" />
                    {!collapsed && <span className="truncate">Cobro en Caja</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenPriceTags}
                    title="Imprimir etiquetas de precio"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <Tag className="w-5 h-5 text-amber-400 shrink-0" />
                    {!collapsed && <span className="truncate">Etiquetas de Precio</span>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Sección: Auditoría y Reportes */}
            <div>
              {!collapsed ? (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Auditoría y Reportes
                </p>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={onOpenKardex}
                    title="Consultar historial de movimientos"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <History className="w-5 h-5 text-purple-400 shrink-0" />
                    {!collapsed && <span className="truncate">Historial (Kardex)</span>}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAuditReport}
                    title="Descargar reporte de valuación de inventario"
                    className={`cursor-pointer w-full flex items-center ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#1E293B] hover:text-white transition-colors`}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                    {!collapsed && <span className="truncate">Reporte de Inventario</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Pie del Menú */}
          <div className="p-3 border-t border-slate-800/80 shrink-0">
            <div className={`p-3 rounded-2xl bg-[#1E293B] flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Inventario al Día</p>
                  <p className="text-[11px] text-slate-400 truncate">Sucursal Centro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Cabecera Superior */}
        <header className="bg-[#FFFFFF] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-xs transition-colors duration-200">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Control de Inventario y Caducidades
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#DCFCE7] dark:bg-emerald-950/80 text-[#166534] dark:text-emerald-300 border border-transparent dark:border-emerald-800/60 shrink-0">
                {storeBranchName}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 truncate">
              Monitoreo de existencias, rotación de mercancía y catálogo comercial.
            </p>
          </div>

          {/* Herramientas de Cabecera (solo Modo Oscuro y Usuario) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Selector de Modo Oscuro / Claro */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="cursor-pointer p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Usuario Encargado */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] dark:border-slate-700">
              <div className="w-9 h-9 rounded-xl bg-[#0D5C75] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-bold text-[#0F172A] dark:text-white">Encargado</p>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400">Sucursal Centro</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenedor Interior */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
