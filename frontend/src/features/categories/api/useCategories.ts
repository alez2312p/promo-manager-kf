import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';

export const CATEGORIES_QUERY_KEY = ['categories'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useCategories() {
  return useQuery<{ data: Category[]; count: number }>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Error al cargar categorías');
      }
      return res.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryInput) => {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la categoría');
      return data;
    },
    onSuccess: (res) => {
      toast.success('Categoría creada', {
        description: `La categoría '${res.data.name}' ha sido registrada.`,
      });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: Error) => {
      toast.error('No se pudo crear la categoría', {
        description: err.message,
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryInput;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Error al actualizar la categoría');
      return data;
    },
    onSuccess: (res) => {
      toast.success('Categoría actualizada', {
        description: `La categoría '${res.data.name}' fue modificada.`,
      });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (err: Error) => {
      toast.error('Error al actualizar', {
        description: err.message,
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      params: string | { id: string; reassignToCategoryId?: string | null }
    ) => {
      const id = typeof params === 'string' ? params : params.id;
      const reassignToCategoryId =
        typeof params === 'object' ? params.reassignToCategoryId : null;

      const url = new URL(`${API_BASE_URL}/api/categories/${id}`);
      if (reassignToCategoryId) {
        url.searchParams.set('reassignToCategoryId', reassignToCategoryId);
      }

      const res = await fetch(url.toString(), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar categoría');
      return data;
    },
    onSuccess: () => {
      toast.success('Categoría eliminada', {
        description:
          'La categoría fue eliminada y los productos actualizados correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: Error) => {
      toast.error('Error al eliminar', {
        description: err.message,
      });
    },
  });
}
