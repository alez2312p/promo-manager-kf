import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
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
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { formatCOP } from '@/lib/utils';
import {
  Promotion,
  PromotionStatus,
} from '../types';
import {
  useUpdatePromotionStatus,
  useDeletePromotion,
} from '../api/usePromotions';
import { EmptyPromotionsState } from './EmptyPromotionsState';
import { EditPromotionModal } from './EditPromotionModal';

interface PromotionsTableProps {
  promotions: Promotion[];
  isLoading: boolean;
  hasFilters?: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
}

export const PromotionsTable: React.FC<PromotionsTableProps> = ({
  promotions,
  isLoading,
  hasFilters = false,
  onResetFilters,
  onCreateNew,
}) => {
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<{ id: string; code: string; name: string } | null>(null);

  const statusMutation = useUpdatePromotionStatus();
  const deleteMutation = useDeletePromotion();

  const handleStatusChange = (id: string, nextStatus: PromotionStatus) => {
    statusMutation.mutate({ id, status: nextStatus });
  };

  const handleConfirmDelete = () => {
    if (deletingPromo) {
      deleteMutation.mutate(deletingPromo.id, {
        onSuccess: () => setDeletingPromo(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2.5 sm:space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-3 sm:p-4 rounded-xl border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
          >
            <Skeleton className="h-4 w-20 sm:w-24" />
            <Skeleton className="h-4 w-36 sm:w-48" />
            <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
            <Skeleton className="h-3 w-28 sm:w-32" />
            <Skeleton className="h-7 w-20 ml-auto" />
          </div>
        ))}
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
    <TooltipProvider delayDuration={200}>
      {/* Mobile Ultra-Compact Card View */}
      <div className="space-y-2.5 block sm:hidden">
        {promotions.map((promo) => {
          const isScheduled = promo.status === 'SCHEDULED';
          const isActive = promo.status === 'ACTIVE';
          const isFinished = promo.status === 'FINISHED';

          return (
            <div
              key={promo.id}
              className="p-3 rounded-xl border bg-card shadow-sm space-y-2"
            >
              {/* Header: Code, Value Badge & Status */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
                    {promo.code}
                  </span>
                  <Badge variant="secondary" className="font-semibold text-[10px] py-0 px-1.5 shrink-0 font-mono">
                    {promo.type === 'PERCENTAGE'
                      ? `${promo.value}% OFF`
                      : `${formatCOP(promo.value)} OFF`}
                  </Badge>
                </div>

                <Badge
                  variant={
                    isScheduled
                      ? 'scheduled'
                      : isActive
                      ? 'active'
                      : 'finished'
                  }
                  className="text-[10px] py-0 px-1.5 shrink-0 capitalize"
                >
                  {isScheduled && 'Programada'}
                  {isActive && 'Activa'}
                  {isFinished && 'Finalizada'}
                </Badge>
              </div>

              {/* Title & Dates */}
              <div className="space-y-0.5">
                <h3 className="font-medium text-foreground text-xs leading-snug line-clamp-1">
                  {promo.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span>
                    {new Date(promo.startDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}{' '}
                    -{' '}
                    {new Date(promo.endDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Compact row */}
              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t">
                {isScheduled && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] gap-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                    onClick={() => handleStatusChange(promo.id, 'ACTIVE')}
                    disabled={statusMutation.isPending}
                  >
                    Activar
                  </Button>
                )}

                {isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] gap-1 border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
                    onClick={() => handleStatusChange(promo.id, 'FINISHED')}
                    disabled={statusMutation.isPending}
                  >
                    Finalizar
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px] gap-1"
                  onClick={() => setEditingPromotion(promo)}
                  disabled={isFinished}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>

                {isScheduled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingPromo({ id: promo.id, code: promo.code, name: promo.name })}
                    disabled={deleteMutation.isPending}
                    title="Eliminar promoción"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Responsive Table */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border bg-card shadow-sm">
        <Table className="min-w-[650px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-foreground">Código</TableHead>
              <TableHead className="font-semibold text-foreground">Campaña</TableHead>
              <TableHead className="font-semibold text-foreground">Descuento</TableHead>
              <TableHead className="font-semibold text-foreground">Vigencia (UTC)</TableHead>
              <TableHead className="font-semibold text-foreground">Estado</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => {
              const isScheduled = promo.status === 'SCHEDULED';
              const isActive = promo.status === 'ACTIVE';
              const isFinished = promo.status === 'FINISHED';

              return (
                <TableRow
                  key={promo.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Code */}
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                      {promo.code}
                    </span>
                  </TableCell>

                  {/* Name & description */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm">
                        {promo.name}
                      </span>
                      {promo.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {promo.description}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Discount */}
                  <TableCell>
                    <Badge variant="secondary" className="font-semibold text-xs font-mono">
                      {promo.type === 'PERCENTAGE'
                        ? `${promo.value}% OFF`
                        : `${formatCOP(promo.value)} OFF`}
                    </Badge>
                  </TableCell>

                  {/* Date range */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>
                        {new Date(promo.startDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        -{' '}
                        {new Date(promo.endDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={
                        isScheduled
                          ? 'scheduled'
                          : isActive
                          ? 'active'
                          : 'finished'
                      }
                      className="capitalize"
                    >
                      {isScheduled && 'Programada'}
                      {isActive && 'Activa'}
                      {isFinished && 'Finalizada'}
                    </Badge>
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Status Transition Actions */}
                      {isScheduled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                          onClick={() => handleStatusChange(promo.id, 'ACTIVE')}
                          disabled={statusMutation.isPending}
                          title="Activar promoción"
                        >
                          <Play className="w-3 h-3" />
                          Activar
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-slate-500/30 text-slate-400 hover:bg-slate-500/10 hover:text-slate-200"
                          onClick={() => handleStatusChange(promo.id, 'FINISHED')}
                          disabled={statusMutation.isPending}
                          title="Finalizar promoción"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Finalizar
                        </Button>
                      )}

                      {/* Edit Button with Domain Rule Tooltip */}
                      {isFinished ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground opacity-40 cursor-not-allowed"
                                disabled
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              Las promociones finalizadas no pueden ser editadas.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => setEditingPromotion(promo)}
                          title="Editar promoción"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Delete Button with Domain Rule Tooltip */}
                      {isScheduled ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingPromo({ id: promo.id, code: promo.code, name: promo.name })}
                          disabled={deleteMutation.isPending}
                          title="Eliminar promoción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground opacity-40 cursor-not-allowed"
                                disabled
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              Solo las promociones en estado 'Programada' pueden
                              ser eliminadas.
                            </p>
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

      {/* Edit Promotion Modal */}
      <EditPromotionModal
        promotion={editingPromotion}
        open={Boolean(editingPromotion)}
        onOpenChange={(open) => {
          if (!open) setEditingPromotion(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deletingPromo)}
        onOpenChange={(open) => {
          if (!open) setDeletingPromo(null);
        }}
        title="¿Eliminar Promoción?"
        description="Esta acción cancelará y eliminará permanentemente la promoción seleccionada."
        itemName={deletingPromo ? `${deletingPromo.code} - ${deletingPromo.name}` : undefined}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </TooltipProvider>
  );
};
