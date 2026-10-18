import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { DispatchStockSchema } from '@/lib/validators/supermarket.schema';

const repo = SupermarketRepository.getInstance();

export async function GET() {
  return NextResponse.json({
    success: true,
    count: repo.movements.length,
    data: [...repo.movements].reverse(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = DispatchStockSchema.parse(body);

    const movements = repo.dispatchStockFEFO(validated);

    return NextResponse.json(
      {
        success: true,
        message: `Despacho FEFO de ${validated.quantity} unidades procesado correctamente.`,
        movements,
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
