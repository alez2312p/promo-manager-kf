import React from 'react';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyPromotionsStateProps {
  hasFilters?: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
}

export const EmptyPromotionsState: React.FC<EmptyPromotionsStateProps> = ({
  hasFilters,
  onResetFilters,
  onCreateNew,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/40 border-dashed border-border/80">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
        <Tag className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters
          ? 'No se encontraron promociones'
          : 'No hay promociones registradas'}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
        {hasFilters
          ? 'No hay promociones que coincidan con los filtros seleccionados. Intenta restablecer los filtros de búsqueda.'
          : 'Comienza creando tu primera campaña o código promocional para atraer más clientes.'}
      </p>

      <div className="flex items-center gap-3">
        {hasFilters && onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Limpiar filtros
          </Button>
        )}
        {onCreateNew && (
          <Button size="sm" onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Promoción
          </Button>
        )}
      </div>
    </div>
  );
};
