import React, { useState } from 'react';
import {
  FolderTree,
  Package,
  Edit3,
  Trash2,
  Plus,
  Layers,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '../types';
import { useDeleteCategory } from '../api/useCategories';
import { EditCategoryModal } from './EditCategoryModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';

interface CategoriesGridProps {
  categories: Category[];
  isLoading: boolean;
  search?: string;
  onCreateNew?: () => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  isLoading,
  search,
  onCreateNew,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const deleteMutation = useDeleteCategory();

  const handleConfirmDelete = (
    categoryId: string,
    reassignToCategoryId: string | null
  ) => {
    deleteMutation.mutate(
      { id: categoryId, reassignToCategoryId },
      {
        onSuccess: () => setDeletingCategory(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border bg-card/60">
            <CardHeader className="p-3.5 sm:p-5 pb-2 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-40" />
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 pt-0">
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 border border-dashed rounded-xl bg-card/30 space-y-2.5">
        <Layers className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-foreground text-sm sm:text-base">
          No se encontraron categorías
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {search
            ? 'No hay categorías que coincidan con la búsqueda actual.'
            : 'Comienza creando tu primera categoría para organizar los productos.'}
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm" className="gap-1.5 mt-2 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Crear Categoría
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {categories.map((cat) => {
          const productCount = cat.productsCount ?? 0;

          return (
            <Card
              key={cat.id}
              className="border hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FolderTree className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <CardTitle className="text-sm sm:text-lg font-bold group-hover:text-primary transition-colors">
                      {cat.name}
                    </CardTitle>
                  </div>

                  {/* Products Count Badge */}
                  <Badge
                    variant="secondary"
                    className="font-normal text-[10px] sm:text-xs gap-1 py-0.5 px-1.5 sm:px-2 bg-muted/60 shrink-0"
                  >
                    <Package className="h-3 w-3 text-muted-foreground" />
                    {productCount} {productCount === 1 ? 'prod.' : 'prods.'}
                  </Badge>
                </div>

                <CardDescription className="text-xs line-clamp-2 mt-1.5">
                  {cat.description || 'Sin descripción asignada.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-5 py-2 sm:py-2.5 border-t bg-muted/10 flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                  ID: {cat.id.slice(0, 8)}...
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingCategory(cat)}
                    title="Editar categoría"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingCategory(cat)}
                    disabled={deleteMutation.isPending}
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      <EditCategoryModal
        category={editingCategory}
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      />

      {/* Intelligent Delete Confirmation & Reassignment Modal */}
      <DeleteCategoryModal
        category={deletingCategory}
        categories={categories}
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
