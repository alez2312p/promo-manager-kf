import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '../types';

interface DeleteCategoryModalProps {
  category: Category | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (categoryId: string, reassignToCategoryId: string | null) => void;
  isLoading?: boolean;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  category,
  categories,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const [reassignTo, setReassignTo] = useState<string>('UNASSIGNED');

  useEffect(() => {
    if (open) {
      setReassignTo('UNASSIGNED');
    }
  }, [open]);

  if (!category) return null;

  const productCount = category.productsCount ?? 0;
  const availableTargetCategories = categories.filter((c) => c.id !== category.id);
  const targetCategoryObj = availableTargetCategories.find((c) => c.id === reassignTo);

  const handleConfirm = () => {
    const targetId = reassignTo === 'UNASSIGNED' ? null : reassignTo;
    onConfirm(category.id, targetId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-5 sm:p-6 space-y-4">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-sm">
            <Trash2 className="w-6 h-6 animate-in zoom-in-50 duration-200" />
          </div>

          <div className="text-center space-y-1.5">
            <DialogTitle className="text-lg font-bold text-foreground">
              ¿Eliminar Categoría "{category.name}"?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {productCount > 0
                ? `Esta categoría cuenta con ${productCount} ${productCount === 1 ? 'producto asociado' : 'productos asociados'
                }.`
                : 'Esta acción no se puede deshacer y eliminará la categoría.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* If category has products, show reassignment assistant */}
        {productCount > 0 && (
          <div className="space-y-3 p-3.5 rounded-xl border bg-muted/30">
            <div className="flex items-start gap-2.5 text-xs text-amber-500">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-foreground leading-snug">
                ¿A qué categoría deseas mover los{' '}
                <span className="font-bold text-primary">{productCount} productos</span>?
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reassign-category-select" className="text-xs font-semibold">
                Categoría de Destino
              </Label>
              <Select value={reassignTo} onValueChange={(val) => setReassignTo(val)}>
                <SelectTrigger id="reassign-category-select" className="bg-background">
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED" className="font-medium text-muted-foreground">
                    Sin Categoría (Por Defecto)
                  </SelectItem>
                  {availableTargetCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed bg-background/60 p-2.5 rounded-lg border border-dashed">
              {reassignTo === 'UNASSIGNED' ? (
                <>
                  Los <b>{productCount} productos</b> se conservarán en el inventario identificados como{' '}
                  <span className="font-semibold text-foreground">"Sin Categoría"</span>.
                </>
              ) : (
                <>
                  Los <b>{productCount} productos</b> se transferirán automáticamente a{' '}
                  <span className="font-semibold text-primary">
                    "{targetCategoryObj?.name}"
                  </span>
                  .
                </>
              )}
            </p>
          </div>
        )}

        <DialogFooter className="pt-2 grid grid-cols-2 gap-3 w-full sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full gap-2 font-semibold shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
