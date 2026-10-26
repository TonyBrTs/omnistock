'use client';

import React, { useState, useEffect } from 'react';
import { StoreCategory } from '@/types/supermarket';
import { X, Plus, Pencil, Trash2, Check, Tags, AlertCircle } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  onCategoriesChanged,
}) => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de nueva categoría
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newAisle, setNewAisle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editAisle, setEditAisle] = useState('');

  // Confirmación de eliminación
  const [categoryToDelete, setCategoryToDelete] = useState<StoreCategory | null>(null);
  const [reassignTarget, setReassignTarget] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      setErrorMsg('No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setEditingId(null);
      setCategoryToDelete(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          code: newCode.trim() || undefined,
          defaultAisle: newAisle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la categoría');
      }

      setNewName('');
      setNewCode('');
      setNewAisle('');
      fetchCategories();
      onCategoriesChanged();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat: StoreCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditCode(cat.code || '');
    setEditAisle(cat.defaultAisle || '');
    setErrorMsg(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setErrorMsg(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          code: editCode.trim() || undefined,
          defaultAisle: editAisle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar la categoría');
      }

      setEditingId(null);
      fetchCategories();
      onCategoriesChanged();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleInitiateDelete = (cat: StoreCategory) => {
    const otherCats = categories.filter((c) => c.id !== cat.id);
    setCategoryToDelete(cat);
    setReassignTarget(otherCats[0]?.name || '');
    setErrorMsg(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setErrorMsg(null);

    const otherCats = categories.filter((c) => c.id !== categoryToDelete.id);
    const validTarget =
      reassignTarget && reassignTarget.toLowerCase() !== categoryToDelete.name.toLowerCase()
        ? reassignTarget
        : otherCats[0]?.name;

    if (!validTarget && otherCats.length > 0) {
      setErrorMsg('Selecciona una categoría válida para reasignar los productos.');
      return;
    }

    try {
      const res = await fetch(
        `/api/categories?id=${categoryToDelete.id}&reassignTo=${encodeURIComponent(validTarget || '')}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar la categoría');
      }

      setCategoryToDelete(null);
      fetchCategories();
      onCategoriesChanged();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const remainingCategories = categoryToDelete
    ? categories.filter((c) => c.id !== categoryToDelete.id)
    : categories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between rounded-t-2xl bg-white dark:bg-[#1E293B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#008767] dark:text-emerald-400 flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
                Departamentos y Categorías
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Personaliza las secciones de la tienda para clasificar tus productos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 text-xs bg-[#FEE2E2] dark:bg-red-950/40 text-[#991B1B] dark:text-red-300 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulario para agregar categoría */}
          <form
            onSubmit={handleAddCategory}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Agregar Nuevo Departamento
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Nombre (ej: Mascotas)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Código (ej: MASC)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Pasillo (ej: Pasillo 07)"
                  value={newAisle}
                  onChange={(e) => setNewAisle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white focus:outline-none focus:border-[#008767] dark:focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="cursor-pointer px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#006e54] text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Guardando...' : 'Crear Departamento'}</span>
              </button>
            </div>
          </form>

          {/* Modal de confirmación de eliminación */}
          {categoryToDelete && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#991B1B] dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800 dark:text-slate-200">
                  <p className="font-bold text-[#991B1B] dark:text-red-400">
                    Eliminar departamento &quot;{categoryToDelete.name}&quot;
                  </p>
                  <p className="mt-0.5">
                    Hay {categoryToDelete.productCount ?? 0} producto(s) en este departamento.
                    Elige a qué categoría reasignarlos antes de eliminar:
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-red-200 dark:border-red-900/60 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  {remainingCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      Reasignar a: {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    className="cursor-pointer px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="cursor-pointer px-3.5 py-1.5 text-xs font-bold text-white bg-[#991B1B] hover:bg-[#7f1d1d] rounded-xl transition-all shadow-xs"
                  >
                    Confirmar Eliminación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Listado de categorías */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Departamentos Activos ({categories.length})
            </span>

            {loading ? (
              <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                Cargando departamentos...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                No hay departamentos definidos.
              </p>
            ) : (
              <div className="border border-[#E2E8F0] dark:border-slate-800 rounded-xl divide-y divide-[#E2E8F0] dark:divide-slate-800 overflow-hidden">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  if (isEditing) {
                    return (
                      <div
                        key={cat.id}
                        className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nombre"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-[#008767] rounded-lg text-slate-900 dark:text-white focus:outline-none font-semibold"
                        />
                        <input
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          placeholder="Código"
                          className="w-24 px-2 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                        />
                        <input
                          type="text"
                          value={editAisle}
                          onChange={(e) => setEditAisle(e.target.value)}
                          placeholder="Pasillo"
                          className="w-32 px-2 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="cursor-pointer p-1.5 bg-[#008767] text-white rounded-lg hover:bg-[#006e54] transition-colors"
                            title="Guardar cambios"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                          {cat.code || 'DEPT'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {cat.defaultAisle || 'Sin pasillo asignado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {cat.productCount ?? 0} prod.
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="cursor-pointer p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#008767] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar departamento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={categories.length <= 1}
                            onClick={() => handleInitiateDelete(cat)}
                            className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-[#991B1B] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Eliminar departamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-slate-700 bg-[#FFFFFF] dark:bg-[#1E293B] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
