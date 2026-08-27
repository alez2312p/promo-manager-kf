import React, { useState } from 'react';
import { FolderTree, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CategoriesGrid,
  CreateCategoryModal,
  useCategories,
} from '@/features/categories';

export const CategoriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useCategories();
  const categories = data?.data || [];

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FolderTree className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
            <span>Categorías de Productos</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organiza y segmenta los productos del inventario y sus promociones.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto gap-2 font-semibold shadow-sm h-9"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Table Section Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Listado de Categorías
          </h2>
          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
            {filteredCategories.length}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Grid of Categories */}
      <CategoriesGrid
        categories={filteredCategories}
        isLoading={isLoading}
        search={search}
        onCreateNew={() => setIsCreateOpen(true)}
      />

      {/* Modal to Create Category */}
      <CreateCategoryModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
};
