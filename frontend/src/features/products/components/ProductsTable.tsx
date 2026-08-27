import React, { useState } from 'react';
import { Package, Edit3, Trash2, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { formatCOP } from '@/lib/utils';
import { Product } from '../types';
import { useDeleteProduct } from '../api/useProducts';
import { EditProductModal } from './EditProductModal';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  search?: string;
  onCreateNew?: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading,
  search,
  onCreateNew,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{
    id: string;
    name: string;
    sku: string;
  } | null>(null);

  const deleteMutation = useDeleteProduct();

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id, {
        onSuccess: () => setDeletingProduct(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-16 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-xl bg-card/30 space-y-3">
        <Package className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-foreground">
          No se encontraron productos
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {search
            ? 'No hay productos que coincidan con la búsqueda actual.'
            : 'Comienza agregando tu primer producto al inventario.'}
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm" className="gap-1.5 mt-2 w-full sm:w-auto">
            Nuevo Producto
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 block sm:hidden">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="p-4 rounded-xl border bg-card shadow-sm space-y-3"
          >
            {/* Header: SKU & Category */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {prod.sku}
              </span>
              <Badge variant="secondary" className="font-normal text-xs">
                {prod.category?.name || 'Sin Categoría'}
              </Badge>
            </div>

            {/* Title & Price */}
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-foreground text-sm">
                {prod.name}
              </p>
              <span className="font-bold text-sm text-foreground shrink-0 font-mono">
                {formatCOP(prod.price)}
              </span>
            </div>

            {/* Footer: Date & Actions */}
            <div className="flex items-center justify-between pt-2 border-t text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(prod.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs gap-1"
                  onClick={() => setEditingProduct(prod)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setDeletingProduct({
                      id: prod.id,
                      name: prod.name,
                      sku: prod.sku,
                    })
                  }
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Responsive Table */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border bg-card shadow-sm">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-foreground">SKU</TableHead>
              <TableHead className="font-semibold text-foreground">Nombre del Producto</TableHead>
              <TableHead className="font-semibold text-foreground">Categoría</TableHead>
              <TableHead className="font-semibold text-foreground">Precio</TableHead>
              <TableHead className="font-semibold text-foreground">Fecha de Creación</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod) => (
              <TableRow
                key={prod.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {/* SKU */}
                <TableCell className="font-mono font-bold text-xs text-primary">
                  <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                    {prod.sku}
                  </span>
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium text-foreground">
                  {prod.name}
                </TableCell>

                {/* Category Badge */}
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {prod.category?.name || 'Sin Categoría'}
                  </Badge>
                </TableCell>

                {/* Price Formatted */}
                <TableCell className="font-semibold text-sm font-mono">
                  {formatCOP(prod.price)}
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>
                      {new Date(prod.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingProduct(prod)}
                      title="Editar producto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setDeletingProduct({
                          id: prod.id,
                          name: prod.name,
                          sku: prod.sku,
                        })
                      }
                      disabled={deleteMutation.isPending}
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
        title="¿Eliminar Producto?"
        description="Esta acción eliminará permanentemente el producto del inventario."
        itemName={
          deletingProduct
            ? `${deletingProduct.sku} - ${deletingProduct.name}`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
