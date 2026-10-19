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
        className={`cursor-pointer w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] shadow-xs hover:border-[#008767] focus:outline-none focus:ring-2 focus:ring-[#008767]/20 focus:border-[#008767] transition-all text-left ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium text-slate-800">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                selectedOption.badgeColor || 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008767]' : ''
          }`}
        />
      </button>

      {/* Menú desplegable flotante estilizado */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 w-full min-w-[220px] max-h-64 overflow-y-auto bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1.5 text-sm text-[#0F172A] focus:outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
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
                  className={`cursor-pointer px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/80 text-[#008767] font-semibold'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {option.icon && (
                      <span className="shrink-0 text-slate-400">{option.icon}</span>
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{option.label}</span>
                        {option.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                              option.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.sublabel && (
                        <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#008767] shrink-0" />
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
