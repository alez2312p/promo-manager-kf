import React, { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MetricsOverview,
  PromotionsTable,
  CreatePromotionModal,
  usePromotions,
  PromotionStatus,
} from '@/features/promotions';

export const HomePage: React.FC = () => {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PromoManager KF</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gestión y Control de Promociones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link to="/health">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                Estado del Servidor
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nueva Promoción
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metrics Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Métricas Generales
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          <MetricsOverview />
        </section>

        {/* Promotions List & Controls */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Listado de Promociones
              </h2>
              <p className="text-sm text-muted-foreground">
                Crea, activa y controla el ciclo de vida de tus descuentos.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  value={statusFilter}
                  onValueChange={(val: PromotionStatus | 'ALL') =>
                    setStatusFilter(val)
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Estado" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="SCHEDULED">Programadas</SelectItem>
                    <SelectItem value="ACTIVE">Activas</SelectItem>
                    <SelectItem value="FINISHED">Finalizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
      </main>

      {/* Modal to Create Promotion */}
      <CreatePromotionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};
