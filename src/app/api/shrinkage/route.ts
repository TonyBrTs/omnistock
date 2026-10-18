import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { z } from 'zod';

const repo = SupermarketRepository.getInstance();

const ShrinkageSchema = z.object({
  batchNumber: z.string().min(1, 'El número de lote es obligatorio'),
  reason: z.enum([
    'FECHA_CADUCADA',
    'RUPTURA_EMPAQUE',
    'PERDIDA_CADENA_FRIO',
    'DANIO_MANIPULACION',
    'RETIRO_SANITARIO',
  ]),
  notes: z.string().min(2, 'Debe especificar el motivo detallado de la merma'),
  operatorName: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ShrinkageSchema.parse(body);

    const movement = repo.markBatchAsShrinkage(
      validated.batchNumber,
      validated.operatorName,
      `[${validated.reason}] ${validated.notes}`
    );

    if (!movement) {
      return NextResponse.json(
        {
          success: false,
          message: `Lote ${validated.batchNumber} no encontrado en inventario activo.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Acta de Merma ejecutada: Lote ${validated.batchNumber} dado de baja por motivo "${validated.reason}" y bloqueado en POS.`,
        movement,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message },
      { status: 400 }
    );
  }
}
