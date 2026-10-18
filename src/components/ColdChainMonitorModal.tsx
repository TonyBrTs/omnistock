'use client';

import React, { useEffect, useState } from 'react';

interface ColdRoomSensor {
  chamberId: string;
  name: string;
  targetTempRange: string;
  currentTemp: number;
  humidity: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  lastPing: string;
  linkedProductsCount: number;
  compressorState: 'ACTIVE' | 'STANDBY' | 'DEFROST';
}

interface ColdChainMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColdChainMonitorModal: React.FC<ColdChainMonitorModalProps> = ({ isOpen, onClose }) => {
  const [chambers, setChambers] = useState<ColdRoomSensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchSensorData = () => {
    setLoading(true);
    fetch('/api/cold-chain')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChambers(data.chambers);
          setLastUpdated(new Date().toLocaleTimeString('es-MX'));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchSensorData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              ❄️
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Monitor de Cadena de Frío IoT (Cámaras 1 a 4)
              </h2>
              <p className="text-xs text-[#64748B]">
                Telemetría en tiempo real para prevención de merma por variación térmica.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSensorData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              🔄 Refrescar
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido de Sensores */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chambers.map((chamber) => {
              const isWarning = chamber.status === 'WARNING';
              const isCritical = chamber.status === 'CRITICAL';

              return (
                <div
                  key={chamber.chamberId}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCritical
                      ? 'bg-red-50/50 border-red-200'
                      : isWarning
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-[#F4F6F9]/60 border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{chamber.name}</h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Rango óptimo: <strong className="text-slate-800">{chamber.targetTempRange}</strong>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        isCritical
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : isWarning
                          ? 'bg-[#FEF9C3] text-[#854D0E]'
                          : 'bg-[#DCFCE7] text-[#166534]'
                      }`}
                    >
                      {chamber.status === 'OPTIMAL' ? 'ÓPTIMO' : chamber.status === 'WARNING' ? 'ALERTA TÉRMICA' : 'CRÍTICO'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-slate-200/60 pt-3">
                    <div>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {chamber.currentTemp > 0 ? `+${chamber.currentTemp}` : chamber.currentTemp} °C
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Humedad: {chamber.humidity}%
                      </span>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500 block text-[10px]">Compresor:</span>
                      <span className="font-semibold text-slate-800">
                        {chamber.compressorState === 'ACTIVE'
                          ? '🟢 Activo'
                          : chamber.compressorState === 'DEFROST'
                          ? '🟡 Descongelamiento'
                          : '⚪ En Espera'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {chamber.linkedProductsCount} lotes vinculados
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-[#0F172A]">Protocolo de Acción Automatizado:</p>
            <p>• Si una cámara permanece &gt; 15 min fuera de rango térmico, el sistema envía notificación a supervisión y marca los lotes como <em>Inspección Requerida</em>.</p>
            <p>• Los productos sensibles (Leches, Embutidos, Mariscos) se bloquean preventivamente en caja POS ante alertas críticas.</p>
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F4F6F9]/40 flex justify-between items-center text-xs text-[#64748B]">
          <span>Última lectura de telemetría: {lastUpdated || 'Cargando...'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#0F172A] font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
