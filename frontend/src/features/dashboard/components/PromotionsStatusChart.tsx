import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromotionMetrics } from '@/features/promotions';

interface PromotionsStatusChartProps {
  metrics?: PromotionMetrics;
  isLoading?: boolean;
}

export const PromotionsStatusChart: React.FC<PromotionsStatusChartProps> = ({
  metrics,
}) => {
  const scheduled = metrics?.totalByStatus?.SCHEDULED ?? 0;
  const active = metrics?.totalByStatus?.ACTIVE ?? 0;
  const finished = metrics?.totalByStatus?.FINISHED ?? 0;
  const total = scheduled + active + finished;

  const scheduledPct = total > 0 ? Math.round((scheduled / total) * 100) : 0;
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
  const finishedPct = total > 0 ? Math.max(0, 100 - scheduledPct - activePct) : 0;

  const states = [
    {
      name: 'Programadas',
      shortName: 'Prog.',
      status: 'SCHEDULED',
      count: scheduled,
      percentage: scheduledPct,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      desc: 'Por iniciar',
    },
    {
      name: 'Activas',
      shortName: 'Activas',
      status: 'ACTIVE',
      count: active,
      percentage: activePct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      desc: 'En curso',
    },
    {
      name: 'Finalizadas',
      shortName: 'Fin.',
      status: 'FINISHED',
      count: finished,
      percentage: finishedPct,
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
      desc: 'Histórico',
    },
  ];

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-bold">
            Distribución del Ciclo de Vida
          </CardTitle>
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground font-mono">
            {total} {total === 1 ? 'Total' : 'Totales'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-5 pt-0 space-y-3 sm:space-y-4">
        {/* Multi-segment Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 sm:h-2.5 w-full rounded-full bg-muted/50 overflow-hidden flex">
            {total === 0 ? (
              <div className="w-full bg-muted/40 h-full" />
            ) : (
              <>
                <div
                  style={{ width: `${scheduledPct}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Programadas: ${scheduledPct}%`}
                />
                <div
                  style={{ width: `${activePct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Activas: ${activePct}%`}
                />
                <div
                  style={{ width: `${finishedPct}%` }}
                  className="bg-slate-500 h-full transition-all duration-500"
                  title={`Finalizadas: ${finishedPct}%`}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground font-mono">
            <span className="text-amber-400 font-semibold">{scheduledPct}% Prog.</span>
            <span className="text-emerald-400 font-semibold">{activePct}% Activas</span>
            <span className="text-slate-400 font-semibold">{finishedPct}% Fin.</span>
          </div>
        </div>

        {/* 3 Inline Status Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {states.map((st) => {
            return (
              <Link
                key={st.status}
                to="/promotions"
                className={`p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border ${st.borderColor} ${st.bgColor} hover:scale-[1.01] transition-all flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
                      <span className="sm:hidden">{st.shortName}</span>
                      <span className="hidden sm:inline">{st.name}</span>
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </div>

                <div className="mt-1.5 sm:mt-2.5 flex items-baseline justify-between">
                  <span className="text-lg sm:text-2xl font-extrabold text-foreground">
                    {st.count}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold ${st.textColor}`}>
                    {st.percentage}%
                  </span>
                </div>

                <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 hidden sm:block truncate">
                  {st.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
