import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Tag, Package, FolderTree, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DashboardMetrics,
  // PromotionsStatusChart,
  ActiveTodayTable,
} from '@/features/dashboard';
import { usePromotions, usePromotionMetrics } from '@/features/promotions';
import { useProducts } from '@/features/products';
import { useCategories } from '@/features/categories';

export const DashboardPage: React.FC = () => {
  const { data: promotionsData, isLoading: isLoadingPromos } = usePromotions();
  const { data: metricsData, isLoading: isLoadingMetrics } = usePromotionMetrics();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const promotions = promotionsData?.data || [];
  const metrics = metricsData?.data;
  const totalProducts = productsData?.count ?? productsData?.data?.length ?? 0;
  const totalCategories = categoriesData?.count ?? categoriesData?.data?.length ?? 0;

  const isLoading =
    isLoadingPromos || isLoadingMetrics || isLoadingProducts || isLoadingCategories;

  const quickModules = [
    {
      title: 'Promociones',
      description: 'Configura descuentos y reglas de negocio',
      count: `${promotions.length} Total`,
      link: '/promotions',
      icon: Tag,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'hover:border-primary/40',
    },
    {
      title: 'Catálogo de Productos',
      description: 'Administra SKUs, precios y categorías',
      count: `${totalProducts} Items`,
      link: '/products',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/40',
    },
    {
      title: 'Categorías',
      description: 'Organiza y segmenta el catálogo',
      count: `${totalCategories} Depts`,
      link: '/categories',
      icon: FolderTree,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-500/40',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/20 via-indigo-500/10 to-transparent border p-4 sm:p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
          <div className="space-y-1 sm:space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] sm:text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Panel Ejecutivo
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              PromoManager KF
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
              Control centralizado de campañas de descuento, catálogo de productos e inventario.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-0">
            <Button asChild size="sm" className="flex-1 sm:flex-none gap-1.5 shadow-sm font-semibold h-8 sm:h-9 text-xs sm:text-sm">
              <Link to="/promotions">
                <Tag className="h-3.5 w-3.5" />
                Promociones
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none gap-1.5 h-8 sm:h-9 text-xs sm:text-sm">
              <Link to="/products">
                <Package className="h-3.5 w-3.5" />
                Catálogo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Panel de Métricas: 2x2 en Móvil */}
      <section className="space-y-2">
        <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Indicadores Principales
        </h2>
        <DashboardMetrics
          activePromotions={metrics?.totalByStatus?.ACTIVE ?? 0}
          activeToday={metrics?.activeToday ?? 0}
          totalProducts={totalProducts}
          totalCategories={totalCategories}
          isLoading={isLoading}
        />
      </section>

      {/* 2. Sección Distribución del Ciclo de Vida (Comentada temporalmente a petición) */}
      {/* 
      <section className="space-y-2 sm:space-y-3">
        <PromotionsStatusChart metrics={metrics} isLoading={isLoadingMetrics} />
      </section>
      */}

      {/* 3. Tabla de Promociones Vigentes Hoy */}
      <section className="space-y-2">
        <ActiveTodayTable promotions={promotions} isLoading={isLoadingPromos} />
      </section>

      {/* 4. Módulos / Accesos Rápidos: Ultra-compactos en Móvil */}
      <section className="space-y-2">
        <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          {quickModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                to={m.link}
                className={`group block rounded-xl border bg-card p-3 sm:p-4 transition-all shadow-sm ${m.border} hover:shadow-md`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg ${m.bg} ${m.color} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {m.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground hidden sm:block truncate mt-0.5">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5">
                      {m.count}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
