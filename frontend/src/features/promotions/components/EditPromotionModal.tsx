import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Edit3, Percent, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdatePromotion } from '../api/usePromotions';
import { useCategories } from '../../categories/api/useCategories';
import { useProducts } from '../../products/api/useProducts';
import { formatCOP } from '@/lib/utils';
import { Promotion } from '../types';

type ScopeType = 'GLOBAL' | 'CATEGORY' | 'PRODUCT';

const editPromotionSchema = z
  .object({
    name: z
      .string({ required_error: 'El nombre es obligatorio' })
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre debe tener máximo 100 caracteres'),
    description: z.string().max(500).optional().nullable(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
      required_error: 'Selecciona el tipo de descuento',
    }),
    value: z.coerce
      .number({ required_error: 'El valor es requerido' })
      .positive('El valor debe ser positivo'),
    minSpend: z.coerce.number().optional().nullable(),
    maxDiscount: z.coerce.number().optional().nullable(),
    startDate: z
      .string({ required_error: 'La fecha de inicio es requerida' })
      .min(1, 'Selecciona la fecha de inicio'),
    endDate: z
      .string({ required_error: 'La fecha de finalización es requerida' })
      .min(1, 'Selecciona la fecha de fin'),
    usageLimit: z.coerce.number().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    productId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'La fecha de fin debe ser posterior a la fecha de inicio.',
        });
      }
    }

    if (data.type === 'PERCENTAGE') {
      if (data.value < 1 || data.value > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'El porcentaje de descuento debe estar entre 1% y 100%.',
        });
      }
    }

    if (data.type === 'FIXED_AMOUNT') {
      if (data.value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'El monto de descuento fijo debe ser mayor a 0.',
        });
      }
    }
  });

type EditPromotionFormValues = z.infer<typeof editPromotionSchema>;

interface EditPromotionModalProps {
  promotion: Promotion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
  promotion,
  open,
  onOpenChange,
}) => {
  const updateMutation = useUpdatePromotion();
  const { data: categoriesData } = useCategories();
  const { data: productsData } = useProducts();

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  const [scope, setScope] = useState<ScopeType>('GLOBAL');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditPromotionFormValues>({
    resolver: zodResolver(editPromotionSchema),
  });

  useEffect(() => {
    if (promotion) {
      const initialScope: ScopeType = promotion.productId
        ? 'PRODUCT'
        : promotion.categoryId
        ? 'CATEGORY'
        : 'GLOBAL';
      setScope(initialScope);

      reset({
        name: promotion.name,
        description: promotion.description || '',
        type: promotion.type,
        value: promotion.value,
        minSpend: promotion.minSpend ?? undefined,
        maxDiscount: promotion.maxDiscount ?? undefined,
        startDate: new Date(promotion.startDate).toISOString().slice(0, 16),
        endDate: new Date(promotion.endDate).toISOString().slice(0, 16),
        usageLimit: promotion.usageLimit ?? undefined,
        categoryId: promotion.categoryId ?? null,
        productId: promotion.productId ?? null,
      });
    }
  }, [promotion, reset]);

  const selectedType = watch('type');

  const handleScopeChange = (newScope: ScopeType) => {
    setScope(newScope);
    if (newScope === 'GLOBAL') {
      setValue('categoryId', null);
      setValue('productId', null);
    } else if (newScope === 'CATEGORY') {
      setValue('productId', null);
    } else if (newScope === 'PRODUCT') {
      setValue('categoryId', null);
    }
  };

  if (!promotion) return null;

  const onSubmit = (values: EditPromotionFormValues) => {
    updateMutation.mutate(
      {
        id: promotion.id,
        payload: {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          type: values.type,
          value: Number(values.value),
          minSpend: values.minSpend ? Number(values.minSpend) : null,
          maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : null,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
          usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
          categoryId: scope === 'CATEGORY' ? values.categoryId || null : null,
          productId: scope === 'PRODUCT' ? values.productId || null : null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit3 className="w-5 h-5 text-primary" />
            Editar Promoción: <span className="font-mono text-primary">{promotion.code}</span>
          </DialogTitle>
          <DialogDescription>
            Modifica las condiciones, alcance y vigencia de esta promoción.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">
              Nombre de la Campaña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="Descuento de Temporada"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Scope Selector: Global vs Category vs Product */}
          <div className="space-y-3 p-3.5 rounded-xl border bg-muted/20">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">
                Alcance del Descuento
              </Label>
            </div>

            <Select
              value={scope}
              onValueChange={(val: ScopeType) => handleScopeChange(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el alcance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBAL">🌐 Toda la Tienda (Global)</SelectItem>
                <SelectItem value="CATEGORY">📂 Toda una Categoría</SelectItem>
                <SelectItem value="PRODUCT">📦 Un Producto Específico</SelectItem>
              </SelectContent>
            </Select>

            {/* Dynamic Category Selector */}
            {scope === 'CATEGORY' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in-50">
                <Label htmlFor="edit-promo-cat" className="text-xs">
                  Seleccionar Categoría Beneficiada <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('categoryId') || undefined}
                  onValueChange={(val) =>
                    setValue('categoryId', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="edit-promo-cat">
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dynamic Product Selector */}
            {scope === 'PRODUCT' && (
              <div className="space-y-1.5 pt-1 animate-in fade-in-50">
                <Label htmlFor="edit-promo-prod" className="text-xs">
                  Seleccionar Producto Beneficiado <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('productId') || undefined}
                  onValueChange={(val) =>
                    setValue('productId', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="edit-promo-prod">
                    <SelectValue placeholder="Elige un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - {formatCOP(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-type">
                Tipo de Descuento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedType}
                onValueChange={(val: 'PERCENTAGE' | 'FIXED_AMOUNT') =>
                  setValue('type', val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Monto Fijo ($ COP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-value">
                Valor {selectedType === 'PERCENTAGE' ? '(%)' : '($ COP)'}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-value"
                  type="number"
                  step={selectedType === 'PERCENTAGE' ? '1' : '500'}
                  placeholder={selectedType === 'PERCENTAGE' ? '20' : '10000'}
                  {...register('value')}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                  {selectedType === 'PERCENTAGE' ? (
                    <Percent className="w-3.5 h-3.5" />
                  ) : (
                    'COP'
                  )}
                </span>
              </div>
              {errors.value && (
                <p className="text-xs text-destructive">{errors.value.message}</p>
              )}
            </div>
          </div>

          {/* Dates: Start and End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-startDate">
                Fecha de Inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-startDate"
                type="datetime-local"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-endDate">
                Fecha de Fin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-endDate"
                type="datetime-local"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-minSpend">Gasto Mínimo ($)</Label>
              <Input
                id="edit-minSpend"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('minSpend')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-usageLimit">Límite Global de Usos</Label>
              <Input
                id="edit-usageLimit"
                type="number"
                placeholder="Ilimitado si es vacío"
                {...register('usageLimit')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Descripción (Opcional)</Label>
            <Input
              id="edit-description"
              placeholder="Detalles sobre las condiciones..."
              {...register('description')}
            />
          </div>

          <DialogFooter className="pt-4 grid grid-cols-2 gap-3 w-full sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full gap-2"
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
