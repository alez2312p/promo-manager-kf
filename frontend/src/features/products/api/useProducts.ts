import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Product, CreateProductInput, UpdateProductInput } from '../types';

export const PRODUCTS_QUERY_KEY = ['products'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useProducts() {
  return useQuery<{ data: Product[]; count: number }>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Error al cargar productos');
      }
      return res.json();
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductInput) => {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name.trim(),
          sku: payload.sku.trim().toUpperCase(),
          price: Number(payload.price),
          categoryId: payload.categoryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear producto');
      return data;
    },
    onSuccess: (res) => {
      toast.success('Producto creado', {
        description: `El producto '${res.data.name}' (${res.data.sku}) fue agregado.`,
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: Error) => {
      toast.error('Error al crear producto', { description: err.message });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductInput;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name?.trim(),
          sku: payload.sku?.trim().toUpperCase(),
          price: payload.price !== undefined ? Number(payload.price) : undefined,
          categoryId: payload.categoryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar producto');
      return data;
    },
    onSuccess: (res) => {
      toast.success('Producto actualizado', {
        description: `El producto '${res.data.name}' fue modificado.`,
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => {
      toast.error('Error al actualizar producto', { description: err.message });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar producto');
      return data;
    },
    onSuccess: () => {
      toast.success('Producto eliminado', {
        description: 'El producto fue eliminado del inventario.',
      });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: Error) => {
      toast.error('Error al eliminar', { description: err.message });
    },
  });
}
