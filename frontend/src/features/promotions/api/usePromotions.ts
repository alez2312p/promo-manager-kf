import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promotionApi } from './promotion.api';
import { CreatePromotionInput, PromotionFilters, PromotionStatus } from '../types';

export const PROMOTIONS_QUERY_KEY = ['promotions'];
export const PROMOTION_METRICS_QUERY_KEY = ['promotion-metrics'];

/**
 * Hook to fetch promotions list with filters
 */
export function usePromotions(filters?: PromotionFilters) {
  return useQuery({
    queryKey: [...PROMOTIONS_QUERY_KEY, filters],
    queryFn: () => promotionApi.getPromotions(filters),
  });
}

/**
 * Hook to fetch promotion aggregate metrics
 */
export function usePromotionMetrics() {
  return useQuery({
    queryKey: PROMOTION_METRICS_QUERY_KEY,
    queryFn: () => promotionApi.getMetrics(),
    refetchInterval: 30000, // Refresh metrics every 30s
  });
}

/**
 * Hook to create a promotion
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromotionInput) => promotionApi.create(payload),
    onSuccess: (response) => {
      toast.success('¡Promoción creada!', {
        description: `La promoción '${response.data.name}' (${response.data.code}) ha sido creada en estado Programada.`,
      });
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROMOTION_METRICS_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error('Error al crear promoción', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update a promotion details
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreatePromotionInput>;
    }) => promotionApi.update(id, payload),
    onSuccess: (response) => {
      toast.success('¡Promoción actualizada!', {
        description: `La promoción '${response.data.name}' (${response.data.code}) ha sido actualizada.`,
      });
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROMOTION_METRICS_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar promoción', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update promotion status
 */
export function useUpdatePromotionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PromotionStatus }) =>
      promotionApi.updateStatus(id, status),
    onSuccess: (response) => {
      toast.success('Estado actualizado', {
        description: `La promoción '${response.data.code}' ahora está en estado '${response.data.status}'.`,
      });
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROMOTION_METRICS_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error('No se pudo cambiar el estado', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a promotion
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionApi.delete(id),
    onSuccess: () => {
      toast.success('Promoción eliminada', {
        description: 'La promoción fue eliminada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROMOTION_METRICS_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar', {
        description: error.message,
      });
    },
  });
}
