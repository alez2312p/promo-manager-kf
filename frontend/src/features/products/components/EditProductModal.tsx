import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3, Loader2, HelpCircle, Wand2 } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUpdateProduct } from '../api/useProducts';
import { useCategories } from '../../categories/api/useCategories';
import { Product } from '../types';
import { toast } from 'sonner';

const updateProductSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre debe tener máximo 150 caracteres'),
  sku: z
    .string({ required_error: 'El SKU es requerido' })
    .min(3, 'El SKU debe tener al menos 3 caracteres')
    .max(50, 'El SKU debe tener máximo 50 caracteres')
    .regex(/^[A-Za-z0-9_-]+$/, 'Solo letras, números y guiones'),
  price: z.coerce
    .number({ required_error: 'El precio es requerido' })
    .positive('El precio debe ser mayor a 0'),
  categoryId: z
    .string({ required_error: 'Selecciona una categoría' })
    .min(1, 'Selecciona una categoría'),
});

type EditProductFormValues = z.infer<typeof updateProductSchema>;

interface EditProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  open,
  onOpenChange,
}) => {
  const updateMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EditProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        price: product.price,
        categoryId: product.categoryId,
      });
    }
  }, [product, reset]);

  const generateSku = () => {
    const name = getValues('name');
    const categoryId = getValues('categoryId');
    const cat = categories.find((c) => c.id === categoryId);
    const catPrefix = cat ? cat.name.slice(0, 3).toUpperCase() : 'PRD';
    const nameClean = name
      ? name
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(0, 4)
          .toUpperCase()
      : 'ITEM';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const generated = `${catPrefix}-${nameClean}-${randomNum}`;
    setValue('sku', generated, { shouldValidate: true });
    toast.info('SKU Generado automáticamente', {
      description: `Se asignó el código: ${generated}`,
    });
  };

  if (!product) return null;

  const onSubmit = (values: EditProductFormValues) => {
    updateMutation.mutate(
      {
        id: product.id,
        payload: {
          name: values.name.trim(),
          sku: values.sku.trim().toUpperCase(),
          price: Number(values.price),
          categoryId: values.categoryId,
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
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto en el inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-prod-name">
              Nombre del Producto <span className="text-destructive">*</span>
            </Label>
            <Input id="edit-prod-name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-prod-cat">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('categoryId')}
              onValueChange={(val) =>
                setValue('categoryId', val, { shouldValidate: true })
              }
            >
              <SelectTrigger id="edit-prod-cat">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* SKU & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-prod-sku">
                    SKU <span className="text-destructive">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground hover:text-primary cursor-help">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs font-semibold mb-1">¿Qué es el SKU?</p>
                      <p className="text-xs text-muted-foreground">
                        Código único interno para identificar el producto en almacén (Ej: <code>BEB-COCA-1500</code>).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] text-primary gap-1 hover:bg-primary/10"
                  onClick={generateSku}
                  title="Regenerar código SKU automáticamente"
                >
                  <Wand2 className="h-2.5 w-2.5" />
                  Auto
                </Button>
              </div>
              <Input
                id="edit-prod-sku"
                className="font-mono uppercase"
                {...register('sku')}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-prod-price">
                Precio ($ COP) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-prod-price"
                  type="number"
                  step="100"
                  placeholder="Ej. 12000"
                  {...register('price')}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">
                  COP
                </span>
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
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
