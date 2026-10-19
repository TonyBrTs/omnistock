'use client';

import React from 'react';
import { StoreMetricCard } from '@/types/supermarket';
import {
  Barcode,
  AlertTriangle,
  ClockAlert,
  Boxes,
} from 'lucide-react';

interface MetricCardsProps {
  metrics: StoreMetricCard[];
}

const getBadgeColor = (variant: StoreMetricCard['variant']) => {
  switch (variant) {
    case 'good':
      return 'bg-[#DCFCE7] text-[#166534]';
    case 'warning':
      return 'bg-[#FEF9C3] text-[#854D0E]';
    case 'danger':
      return 'bg-[#FEE2E2] text-[#991B1B]';
    default:
      return 'bg-blue-50 text-blue-700';
  }
};

const renderIcon = (icon: StoreMetricCard['icon']) => {
  switch (icon) {
    case 'barcode':
      return <Barcode className="w-5 h-5 text-[#008767]" />;
    case 'low-stock':
      return <AlertTriangle className="w-5 h-5 text-[#854D0E]" />;
    case 'expiry-alert':
      return <ClockAlert className="w-5 h-5 text-[#991B1B]" />;
    default:
      return <Boxes className="w-5 h-5 text-[#0D5C75]" />;
  }
};

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <section
      aria-label="Indicadores del Inventario"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {metrics.map((card) => (
        <article
          key={card.id}
          className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default min-w-0 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
                {card.title}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{card.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F4F6F9] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              {renderIcon(card.icon)}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight truncate">{card.value}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${getBadgeColor(
                card.variant
              )}`}
            >
              {card.badgeText}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
};
