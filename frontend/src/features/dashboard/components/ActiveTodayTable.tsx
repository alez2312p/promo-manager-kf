import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Calendar, Tag, ExternalLink } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCOP } from '@/lib/utils';
import { Promotion } from '@/features/promotions';

interface ActiveTodayTableProps {
  promotions: Promotion[];
  isLoading: boolean;
}

export const ActiveTodayTable: React.FC<ActiveTodayTableProps> = ({
  promotions,
  isLoading,
}) => {
  const now = new Date().getTime();

  // Filter promotions that are ACTIVE and whose date range includes today
  const activeTodayPromos = promotions.filter((p) => {
    if (p.status !== 'ACTIVE') return false;
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.endDate).getTime();
    return start <= now && end >= now;
  });

  return (
    <Card className="border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-3.5 sm:p-5 pb-2 sm:pb-3 flex flex-row items-center justify-between gap-2 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold">
              Promociones Vigentes Hoy
            </CardTitle>
          </div>
          <CardDescription className="text-[11px] sm:text-xs mt-0.5">
            Campañas actualmente activas y aplicables en este momento.
          </CardDescription>
        </div>

        <Button asChild variant="outline" size="sm" className="text-xs gap-1 h-7 sm:h-8 px-2 sm:px-3 shrink-0">
          <Link to="/promotions">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-3 sm:p-0">
        {isLoading ? (
          <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2.5 border rounded-lg sm:border-0 sm:p-0">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : activeTodayPromos.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4 space-y-1.5">
            <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              No hay promociones vigentes hoy
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xs mx-auto">
              Activa una promoción programada para verla reflejada aquí.
            </p>
            <Button asChild size="sm" className="mt-2 text-xs gap-1 h-7">
              <Link to="/promotions">
                Ir a Promociones
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile View: Ultra-compact Items */}
            <div className="space-y-2 block sm:hidden">
              {activeTodayPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="p-2.5 rounded-lg border bg-card/80 flex items-center justify-between gap-2.5 shadow-sm"
                >
                  <div className="min-w-0 space-y-0.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                        {promo.code}
                      </span>
                      <Badge variant="secondary" className="font-semibold text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20 py-0 px-1.5 shrink-0 font-mono">
                        {promo.type === 'PERCENTAGE'
                          ? `${promo.value}% OFF`
                          : `${formatCOP(promo.value)} OFF`}
                      </Badge>
                    </div>

                    <p className="font-medium text-foreground text-xs truncate">
                      {promo.name}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <span>
                        Hasta {new Date(promo.endDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0">
                    <Link to="/promotions" title="Gestionar">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop View: Responsive Table with horizontal scroll */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">Código</TableHead>
                    <TableHead className="font-semibold text-foreground">Campaña</TableHead>
                    <TableHead className="font-semibold text-foreground">Descuento</TableHead>
                    <TableHead className="font-semibold text-foreground">Vigencia hasta</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTodayPromos.map((promo) => (
                    <TableRow key={promo.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                          {promo.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground text-sm">
                          {promo.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-semibold text-xs text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-mono">
                          {promo.type === 'PERCENTAGE'
                            ? `${promo.value}% OFF`
                            : `${formatCOP(promo.value)} OFF`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>
                            {new Date(promo.endDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs text-primary">
                          <Link to="/promotions">
                            Gestionar <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
