import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';

const repo = SupermarketRepository.getInstance();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = repo.updateProduct(id, {
      name: body.name?.trim(),
      brand: body.brand?.trim(),
      department: body.department,
      aisleLocation: body.aisleLocation?.trim(),
      storageTemp: body.storageTemp,
      salePrice: Number(body.salePrice),
      unitCost: Number(body.unitCost),
      minStockAlert: Number(body.minStockAlert),
      baseUom: body.baseUom,
      packEquivalence: body.packEquivalence,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar producto' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = repo.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente del inventario',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar producto' },
      { status: 400 }
    );
  }
}
