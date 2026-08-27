import React from 'react';
import {
  Trash2,
  Play,
  CheckCircle,
  Percent,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Promotion, PromotionStatus } from '../types';
import {
  useUpdatePromotionStatus,
  useDeletePromotion,
} from '../api/usePromotions';
import { EmptyPromotionsState } from './EmptyPromotionsState';

interface PromotionsTableProps {
  promotions?: Promotion[];
  isLoading: boolean;
  hasFilters?: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
}

const statusMap: Record<
  PromotionStatus,
  { label: string; variant: 'scheduled' | 'active' | 'finished' }
> = {
  SCHEDULED: { label: 'Programada', variant: 'scheduled' },
  ACTIVE: { label: 'Activa', variant: 'active' },
  FINISHED: { label: 'Finalizada', variant: 'finished' },
};

export const PromotionsTable: React.FC<PromotionsTableProps> = ({
  promotions = [],
  isLoading,
  hasFilters,
  onResetFilters,
  onCreateNew,
}) => {
  const updateStatusMutation = useUpdatePromotionStatus();
  const deleteMutation = useDeletePromotion();

  const handleStatusChange = (id: string, newStatus: PromotionStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la promoción ${code}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <EmptyPromotionsState
        hasFilters={hasFilters}
        onResetFilters={onResetFilters}
        onCreateNew={onCreateNew}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Código</TableHead>
              <TableHead className="font-semibold text-foreground">Nombre / Descripción</TableHead>
              <TableHead className="font-semibold text-foreground">Descuento</TableHead>
              <TableHead className="font-semibold text-foreground">Vigencia (Inicio - Fin)</TableHead>
              <TableHead className="font-semibold text-foreground">Estado</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => {
              const statusInfo = statusMap[promo.status];
              const isScheduled = promo.status === 'SCHEDULED';
              const isActive = promo.status === 'ACTIVE';
              const isFinished = promo.status === 'FINISHED';

              return (
                <TableRow key={promo.id} className="hover:bg-muted/30 transition-colors">
                  {/* Code */}
                  <TableCell className="font-mono font-bold text-primary">
                    <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                      {promo.code}
                    </span>
                  </TableCell>

                  {/* Name & Description */}
                  <TableCell>
                    <div className="font-medium text-foreground">{promo.name}</div>
                    {promo.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {promo.description}
                      </div>
                    )}
                  </TableCell>

                  {/* Discount Value */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1 font-semibold text-sm">
                      {promo.type === 'PERCENTAGE' ? (
                        <>
                          <Percent className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{promo.value}%</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>${promo.value.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Date Range */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>
                        {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* State transition buttons */}
                      {isScheduled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 text-emerald-500"
                          onClick={() => handleStatusChange(promo.id, 'ACTIVE')}
                          disabled={updateStatusMutation.isPending}
                          title="Activar promoción"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Activar
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-slate-500/30 hover:bg-slate-500/10 hover:text-slate-300 text-slate-400"
                          onClick={() => handleStatusChange(promo.id, 'FINISHED')}
                          disabled={updateStatusMutation.isPending}
                          title="Finalizar promoción"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Finalizar
                        </Button>
                      )}

                      {isFinished && (
                        <span className="text-xs text-muted-foreground italic px-2">
                          Cerrada
                        </span>
                      )}

                      {/* Delete Button with Tooltip */}
                      {isScheduled ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(promo.id, promo.code)}
                          disabled={deleteMutation.isPending}
                          title="Eliminar promoción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} className="inline-block">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-popover text-popover-foreground border border-border">
                            <div className="flex items-center gap-1 text-xs">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Solo las promociones en estado <strong>Programada</strong> pueden ser eliminadas.</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
