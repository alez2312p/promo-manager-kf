import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Percent, Target } from 'lucide-react';
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
import { useCreatePromotion } from '../api/usePromotions';
import { useCategories } from '../../categories/api/useCategories';
import { useProducts } from '../../products/api/useProducts';
import { formatCOP } from '@/lib/utils';

type ScopeType = 'GLOBAL' | 'CATEGORY' | 'PRODUCT';

const promotionFormSchema = z
  .object({
    code: z
      .string({ required_error: 'El código es obligatorio' })
      .min(3, 'El código debe tener al menos 3 caracteres')
      .max(30, 'El código debe tener máximo 30 caracteres')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Solo se permiten letras, números, guiones y guiones bajos'
      ),
    name: z
      .string({ required_error: 'El nombre es obligatorio' })
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre debe tener máximo 100 caracteres'),
    description: z.string().max(500).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
      required_error: 'Selecciona el tipo de descuento',
    }),
    value: z.coerce
      .number({ required_error: 'El valor es requerido' })
      .positive('El valor debe ser positivo'),
    minSpend: z.coerce.number().optional(),
    maxDiscount: z.coerce.number().optional(),
    startDate: z
      .string({ required_error: 'La fecha de inicio es requerida' })
      .min(1, 'Selecciona la fecha de inicio'),
    endDate: z
      .string({ required_error: 'La fecha de finalización es requerida' })
      .min(1, 'Selecciona la fecha de fin'),
    usageLimit: z.coerce.number().optional(),
    categoryId: z.string().optional().nullable(),
    productId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 1. Business Rule: End date must be strictly after start date
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

    // 2. Business Rule: PERCENTAGE value must be between 1 and 100
    if (data.type === 'PERCENTAGE') {
      if (data.value < 1 || data.value > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'El porcentaje de descuento debe estar entre 1% y 100%.',
        });
      }
    }

    // 3. Business Rule: FIXED_AMOUNT must be > 0
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

type PromotionFormValues = z.infer<typeof promotionFormSchema>;

interface CreatePromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreatePromotion();
  const { data: categoriesData } = useCategories();
  const { data: productsData } = useProducts();

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  const [scope, setScope] = useState<ScopeType>('GLOBAL');

  const defaultStartDate = new Date().toISOString().slice(0, 16);
  const defaultEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      type: 'PERCENTAGE',
      value: 10,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    },
  });

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

  const onSubmit = (values: PromotionFormValues) => {
    createMutation.mutate(
      {
        code: values.code.trim().toUpperCase(),
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
      {
        onSuccess: () => {
          reset();
          setScope('GLOBAL');
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
            <Plus className="w-5 h-5 text-primary" />
            Nueva Promoción
          </DialogTitle>
          <DialogDescription>
            Crea una campaña de descuento para toda la tienda, una categoría o un producto específico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Code & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="PROMO2026"
                className="font-mono uppercase"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">
                Tipo de Descuento <span className="text-destructive">*</span>
              </Label>
              <Select
                defaultValue="PERCENTAGE"
                onValueChange={(val: 'PERCENTAGE' | 'FIXED_AMOUNT') =>
                  setValue('type', val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Monto Fijo ($)</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nombre de la Campaña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Descuento de Temporada Verano"
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
                <Label htmlFor="promo-cat" className="text-xs">
                  Seleccionar Categoría Beneficiada <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(val) =>
                    setValue('categoryId', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="promo-cat">
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
                <Label htmlFor="promo-prod" className="text-xs">
                  Seleccionar Producto Beneficiado <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(val) =>
                    setValue('productId', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="promo-prod">
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

          {/* Value & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value">
                Valor {selectedType === 'PERCENTAGE' ? '(%)' : '($ COP)'}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="value"
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

            <div className="space-y-1.5">
              <Label htmlFor="usageLimit">Límite Global de Usos</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="Ilimitado si es vacío"
                {...register('usageLimit')}
              />
            </div>
          </div>

          {/* Dates: Start and End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">
                Fecha de Inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
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
              <Label htmlFor="endDate">
                Fecha de Fin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              placeholder="Detalles sobre las condiciones de la promoción..."
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
              disabled={createMutation.isPending}
              className="w-full gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Crear Promoción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
