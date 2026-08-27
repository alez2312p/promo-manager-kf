import React from 'react';
import { Clock, Play, CheckCircle2, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePromotionMetrics } from '../api/usePromotions';

export const MetricsOverview: React.FC = () => {
  const { data, isLoading } = usePromotionMetrics();

  const metrics = data?.data;

  const cards = [
    {
      title: 'Programadas',
      value: metrics?.totalByStatus?.SCHEDULED ?? 0,
      description: 'Pendientes',
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Activas',
      value: metrics?.totalByStatus?.ACTIVE ?? 0,
      description: 'En curso',
      icon: Play,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Finalizadas',
      value: metrics?.totalByStatus?.FINISHED ?? 0,
      description: 'Concluidas',
      icon: CheckCircle2,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
    },
    {
      title: 'Vigente Hoy',
      value: metrics?.activeToday ?? 0,
      description: 'Activas hoy',
      icon: Flame,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      highlight: true,
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
            <Skeleton className="h-2.5 w-16 sm:w-28 mt-1.5" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`border ${card.border} ${
              card.highlight
                ? 'shadow-sm bg-gradient-to-b from-card to-card/90'
                : 'bg-card'
            } transition-all hover:scale-[1.01]`}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  {card.title}
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
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
