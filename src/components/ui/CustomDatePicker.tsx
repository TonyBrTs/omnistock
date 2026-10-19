'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // formato YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  required?: boolean;
  align?: 'left' | 'right';
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Elige una fecha...',
  className = '',
  ariaLabel,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar fecha visualizada (año y mes)
  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Actualizar vista al cambiar el valor externo
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-').map(Number);
      setViewYear(year);
      setViewMonth(month - 1);
    }
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Formato legible en español
  const formattedDisplay = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return '';
    }
    const [year, month, day] = value.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [value]);

  // Navegar meses
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Cálculo de los días del mes para la cuadrícula
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; monthOffset: number; dateString: string }[] = [];

    // Días del mes anterior para rellenar
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 12 : viewMonth;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, monthOffset: -1, dateString });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const m = viewMonth + 1;
      const dateString = `${viewYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, monthOffset: 0, dateString });
    }

    // Días del mes siguiente para completar la matriz
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 1 : viewMonth + 2;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, monthOffset: 1, dateString });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Atajos rápidos para inventario de supermercado
  const applyQuickOffset = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    setViewYear(y);
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botón trigger del calendario */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel || 'Seleccionar fecha en calendario'}
        className={`cursor-pointer w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-xs hover:border-[#008767] focus:outline-none focus:ring-2 focus:ring-[#008767]/20 focus:border-[#008767] transition-all text-left ${
          isOpen ? 'border-[#008767] ring-2 ring-[#008767]/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#008767] shrink-0" />
          <span className={`truncate font-medium text-xs sm:text-sm ${formattedDisplay ? 'text-slate-900' : 'text-slate-400'}`}>
            {formattedDisplay || placeholder}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
          {value || 'Fecha'}
        </span>
      </button>

      {/* Popover desplegable del calendario contenido sin desbordes */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 p-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-[280px] max-w-[calc(100vw-2.5rem)] text-[#0F172A] animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Cabecera con selector de mes y año */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mes anterior"
              className="cursor-pointer p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center font-bold text-xs text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Mes siguiente"
              className="cursor-pointer p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Atajos rápidos para fechas de vencimiento */}
          <div className="mb-2.5 pt-1 border-t border-slate-100">
            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Atajos de Vencimiento:
            </p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => applyQuickOffset(7)}
                className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#008767] font-semibold hover:bg-emerald-100 transition-colors"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => applyQuickOffset(15)}
                className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#008767] font-semibold hover:bg-emerald-100 transition-colors"
              >
                +15d
              </button>
              <button
                type="button"
                onClick={() => applyQuickOffset(30)}
                className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#008767] font-semibold hover:bg-emerald-100 transition-colors"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={() => applyQuickOffset(180)}
                className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#008767] font-semibold hover:bg-emerald-100 transition-colors"
              >
                +6m
              </button>
              <button
                type="button"
                onClick={() => applyQuickOffset(365)}
                className="cursor-pointer text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#008767] font-semibold hover:bg-emerald-100 transition-colors"
              >
                +1a
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-slate-400 py-0.5">
                {wd}
              </span>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const isSelected = item.dateString === value;
              const isToday = item.dateString === todayStr;
              const isOtherMonth = item.monthOffset !== 0;

              return (
                <button
                  key={`${item.dateString}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(item.dateString);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer h-7 w-7 mx-auto rounded-lg text-xs flex items-center justify-center font-medium transition-all ${
                    isSelected
                      ? 'bg-[#008767] text-white font-bold shadow-xs scale-105'
                      : isOtherMonth
                      ? 'text-slate-300 hover:bg-slate-50'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-[#008767]'
                  } ${isToday && !isSelected ? 'ring-1 ring-[#008767] font-bold text-[#008767]' : ''}`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Pie del calendario con botón Hoy */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                const [y, m] = todayStr.split('-').map(Number);
                setViewYear(y);
                setViewMonth(m - 1);
                setIsOpen(false);
              }}
              className="cursor-pointer flex items-center gap-1 text-slate-600 hover:text-[#008767] font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hoy</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
