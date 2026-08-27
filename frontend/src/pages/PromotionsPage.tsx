import React, { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  MetricsOverview,
  PromotionsTable,
  CreatePromotionModal,
  usePromotions,
  PromotionStatus,
} from '@/features/promotions';

export const PromotionsPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const { data, isLoading, refetch, isFetching } = usePromotions({
    search: search || undefined,
    status: statusFilter,
  });

  const promotions = data?.data || [];
  const hasFilters = Boolean(search || statusFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
            <span>Gestión de Promociones</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Crea, activa y controla el ciclo de vida de tus campañas de descuento.
          </p>
        </div>

        <Button
          size="default"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto gap-2 font-semibold shadow-sm h-9"
        >
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      {/* Metrics Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Métricas de Campañas
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground p-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        <MetricsOverview />
      </section>

      {/* Table Section & Filters */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Listado de Promociones
            </h2>
            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
              {promotions.length}
            </span>
          </div>

          {/* Search + Filter Icon side-by-side in single line */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar código o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs sm:text-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val: PromotionStatus | 'ALL') =>
                setStatusFilter(val)
              }
            >
              <SelectTrigger
                className={`h-9 w-14 p-0 flex items-center justify-center shrink-0 ${statusFilter !== 'ALL'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'text-muted-foreground'
                  }`}
                title={
                  statusFilter === 'ALL'
                    ? 'Filtrar por estado'
                    : `Filtro activo: ${statusFilter}`
                }
              >
                <Filter className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Programadas</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="FINISHED">Finalizadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Promotions Table */}
        <PromotionsTable
          promotions={promotions}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onResetFilters={handleResetFilters}
          onCreateNew={() => setIsCreateModalOpen(true)}
        />
      </section>

      {/* Modal Form */}
      <CreatePromotionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};
