import React from 'react';
import { CalendarClock, Zap, CheckCircle2, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePromotionMetrics } from '../api/usePromotions';

export const MetricsOverview: React.FC = () => {
  const { data, isLoading, isError } = usePromotionMetrics();

  const metrics = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border bg-card/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-14" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return null;
  }

  const cards = [
    {
      title: 'Programadas',
      value: metrics.totalByStatus.SCHEDULED,
      description: 'Listas para activarse',
      icon: CalendarClock,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badgeColor: 'text-amber-400 bg-amber-500/10',
    },
    {
      title: 'Activas',
      value: metrics.totalByStatus.ACTIVE,
      description: 'En circulación ahora',
      icon: Zap,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      badgeColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Finalizadas',
      value: metrics.totalByStatus.FINISHED,
      description: 'Campaña completada',
      icon: CheckCircle2,
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-500/10 border-slate-500/20',
      badgeColor: 'text-slate-400 bg-slate-500/10',
    },
    {
      title: 'Vigente Hoy (UTC)',
      value: metrics.activeToday,
      description: 'Activas dentro del día',
      icon: Flame,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/15 border-indigo-500/30 ring-1 ring-indigo-500/30',
      badgeColor: 'text-indigo-400 bg-indigo-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border transition-all duration-200 hover:shadow-md ${card.bgColor}`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </p>
                <h4 className="text-2xl font-extrabold mt-1 text-foreground">
                  {card.value}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.description}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center justify-center ${card.badgeColor}`}
              >
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
