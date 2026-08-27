import React from 'react';
import { Sparkles, Flame, Package, FolderTree } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardMetricsProps {
  activePromotions: number;
  activeToday: number;
  totalProducts: number;
  totalCategories: number;
  isLoading: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  activePromotions,
  activeToday,
  totalProducts,
  totalCategories,
  isLoading,
}) => {
  const cards = [
    {
      title: 'Activas',
      fullTitle: 'Promociones Activas',
      value: activePromotions,
      subtitle: 'En circulación',
      icon: Sparkles,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Vigente Hoy',
      fullTitle: 'Vigentes Hoy',
      value: activeToday,
      subtitle: 'Aplicables ahora',
      icon: Flame,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      highlight: true,
    },
    {
      title: 'Productos',
      fullTitle: 'Total Productos',
      value: totalProducts,
      subtitle: 'En inventario',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'Categorías',
      fullTitle: 'Total Categorías',
      value: totalCategories,
      subtitle: 'Departamentos',
      icon: FolderTree,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border bg-card/60 p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 sm:w-24" />
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg" />
            </div>
            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-2 sm:mt-3" />
            <Skeleton className="h-2.5 w-16 sm:w-24 mt-1.5" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`border ${card.border} ${
              card.highlight
                ? 'shadow-sm bg-gradient-to-b from-card to-card/90'
                : 'bg-card'
            } transition-all hover:scale-[1.01]`}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  <span className="sm:hidden">{card.title}</span>
                  <span className="hidden sm:inline">{card.fullTitle}</span>
                </span>
                <div
                  className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${card.bg} ${card.color}`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>

              <div className="mt-1.5 sm:mt-3 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </span>
              </div>

              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
