import React, { useState } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  ProductsTable,
  CreateProductModal,
  useProducts,
} from '@/features/products';
import { useCategories } from '@/features/categories';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: categoriesData } = useCategories();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
            <span>Catálogo de Productos</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Administra, crea y edita los productos del inventario y sus categorías.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto gap-2 font-semibold shadow-sm h-9"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Table Section & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Listado de Productos
          </h2>
          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
            {filteredProducts.length}
          </span>
        </div>

        {/* Search + Filter Icon side-by-side in single line */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar SKU o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs sm:text-sm"
            />
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger
              className={`h-9 w-14 p-0 flex items-center justify-center shrink-0 ${selectedCategory !== 'ALL'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'text-muted-foreground'
                }`}
              title={
                selectedCategory === 'ALL'
                  ? 'Filtrar por categoría'
                  : `Categoría filtrada`
              }
            >
              <Filter className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        isLoading={isLoadingProducts}
        search={search}
        onCreateNew={() => setIsCreateOpen(true)}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
};
