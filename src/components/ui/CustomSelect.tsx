'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  menuWidthClass?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción...',
  className = '',
  buttonClassName = '',
  ariaLabel,
  disabled = false,
  align = 'left',
  menuWidthClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Cerrar al hacer clic fuera del dropdown
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

  // Manejo de teclado (Escape para cerrar)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Botón principal del desplegable */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`cursor-pointer w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-sm bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 shadow-xs hover:border-[#008767] dark:hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-[#008767]/20 dark:focus:ring-emerald-500/30 focus:border-[#008767] dark:focus:border-emerald-500 transition-all text-left ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/60' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium text-slate-800 dark:text-slate-100">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                selectedOption.badgeColor || 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008767] dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Menú desplegable flotante estilizado sin desbordes */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-xl py-1 text-sm text-[#0F172A] dark:text-slate-100 focus:outline-none animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuWidthClass || 'w-full max-w-[calc(100vw-2rem)]'}`}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 text-center">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/70 text-[#008767] dark:text-emerald-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {option.icon && (
                      <span className="shrink-0 text-slate-400 dark:text-slate-500">{option.icon}</span>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate text-xs font-semibold">{option.label}</span>
                        {option.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              option.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.sublabel && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#008767] dark:text-emerald-400 shrink-0 ml-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
