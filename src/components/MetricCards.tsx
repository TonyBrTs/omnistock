'use client';

import React from 'react';
import { StoreMetricCard } from '@/types/supermarket';

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
      return 'bg-slate-100 text-[#0D5C75]';
  }
};

const renderIcon = (icon: StoreMetricCard['icon']) => {
  switch (icon) {
    case 'barcode':
      return (
        <svg className="w-5 h-5 text-[#008767]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10M8 7v10M12 7v10M17 7v10M20 7v10" />
        </svg>
      );
    case 'low-stock':
      return (
        <svg className="w-5 h-5 text-[#854D0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'expiry-alert':
      return (
        <svg className="w-5 h-5 text-[#991B1B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'cold-chain':
      return (
        <svg className="w-5 h-5 text-[#0D5C75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
};

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <section
      aria-label="Indicadores Operativos del Supermercado"
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      {metrics.map((card) => (
        <article
          key={card.id}
          className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{card.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F4F6F9] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              {renderIcon(card.icon)}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{card.value}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(
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
