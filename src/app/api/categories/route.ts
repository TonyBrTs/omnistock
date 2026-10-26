import { NextResponse } from 'next/server';
import { SupermarketRepository } from '@/lib/repositories/supermarket.repository';
import { CategorySchema } from '@/lib/validators/supermarket.schema';

const repo = SupermarketRepository.getInstance();

export async function GET() {
  const categories = repo.getCategories();
  return NextResponse.json({
    success: true,
    count: categories.length,
    data: categories,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CategorySchema.parse(body);

    const existing = repo.categories.find(
      (c) => c.name.toLowerCase() === validated.name.trim().toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe un departamento con el nombre "${validated.name.trim()}".`,
        },
        { status: 400 }
      );
    }

    const newCategory = repo.addCategory({
      name: validated.name,
      code: validated.code,
      defaultAisle: validated.defaultAisle,
      requiresColdChain: validated.requiresColdChain,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Categoría "${newCategory.name}" guardada exitosamente.`,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || 'Error al guardar la categoría',
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, code, defaultAisle, requiresColdChain } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El ID de la categoría es requerido' },
        { status: 400 }
      );
    }

    const updated = repo.updateCategory(id, {
      name,
      code,
      defaultAisle,
      requiresColdChain,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Categoría "${updated.name}" actualizada exitosamente.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar la categoría' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let reassignTo = searchParams.get('reassignTo') || undefined;

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      if (body.reassignTo) reassignTo = body.reassignTo;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El ID de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const deleted = repo.deleteCategory(id, reassignTo);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada y productos reasignados correctamente',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar la categoría' },
      { status: 400 }
    );
  }
}
