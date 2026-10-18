import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { ReceiveBatchSchema } from '@/lib/validators/supermarket.schema';

const repo = SupermarketRepository.getInstance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  let list = repo.batches;
  if (productId) {
    list = list.filter((b) => b.productId === productId);
  }

  // Ordenamiento FEFO por defecto
  list.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  return NextResponse.json({
    success: true,
    count: list.length,
    data: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ReceiveBatchSchema.parse(body);

    const result = repo.receiveBatch(validated);

    return NextResponse.json(
      {
        success: true,
        message: `Lote FEFO ${validated.batchNumber} recibido exitosamente.`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message },
      { status: 400 }
    );
  }
}
