import { NextResponse } from 'next/server';

export interface ColdRoomSensor {
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

const COLD_CHAMBERS: ColdRoomSensor[] = [
  {
    chamberId: 'cam-01',
    name: 'Cámara 1 · Lácteos & Yogurts',
    targetTempRange: '2.0°C a 4.0°C',
    currentTemp: 2.8,
    humidity: 78,
    status: 'OPTIMAL',
    lastPing: 'Hace 45 seg',
    linkedProductsCount: 48,
    compressorState: 'ACTIVE',
  },
  {
    chamberId: 'cam-02',
    name: 'Cámara 2 · Salchichonería & Carnes Frías',
    targetTempRange: '0.0°C a 2.0°C',
    currentTemp: 1.4,
    humidity: 82,
    status: 'OPTIMAL',
    lastPing: 'Hace 1 min',
    linkedProductsCount: 32,
    compressorState: 'STANDBY',
  },
  {
    chamberId: 'cam-03',
    name: 'Cámara 3 · Congelados & Helados',
    targetTempRange: '-20.0°C a -18.0°C',
    currentTemp: -18.6,
    humidity: 60,
    status: 'OPTIMAL',
    lastPing: 'Hace 30 seg',
    linkedProductsCount: 74,
    compressorState: 'ACTIVE',
  },
  {
    chamberId: 'cam-04',
    name: 'Cámara 4 · Frutas Delicadas & Berries',
    targetTempRange: '4.0°C a 6.0°C',
    currentTemp: 6.8,
    humidity: 89,
    status: 'WARNING',
    lastPing: 'Hace 15 seg',
    linkedProductsCount: 19,
    compressorState: 'DEFROST',
  },
];

export async function GET() {
  const avgTemp = 3.1;
  const criticalCount = COLD_CHAMBERS.filter((c) => c.status === 'CRITICAL').length;
  const warningCount = COLD_CHAMBERS.filter((c) => c.status === 'WARNING').length;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    overallHealth: criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'HEALTHY',
    averageColdRoomTemp: `${avgTemp} °C`,
    totalChambers: COLD_CHAMBERS.length,
    chambers: COLD_CHAMBERS,
  });
}
