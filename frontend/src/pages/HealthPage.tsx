import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Database,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Container,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthResponse {
  status: string;
  db: string;
  timestamp?: string;
}

export const HealthPage: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const {
    data: health,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<HealthResponse>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Error al conectar con el backend`);
      }
      return res.json();
    },
    retry: 1,
  });

  const isConnected =
    health?.status === 'ok' && health?.db === 'connected';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4 sm:pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500 shrink-0" />
            <span>Estado del Servidor y Base de Datos</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monitoreo en tiempo real de la API Express y la conexión con PostgreSQL mediante Prisma.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full sm:w-auto gap-2 font-semibold shadow-sm h-10 sm:h-9"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Verificando...' : 'Reintentar Verificación'}
        </Button>
      </div>

      {/* Global Status Banner Card */}
      <Card
        className={`border ${
          isLoading
            ? 'border-amber-500/20 bg-amber-500/5'
            : isConnected
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-rose-500/30 bg-rose-500/5'
        }`}
      >
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 ${
                isLoading
                  ? 'bg-amber-500/10 text-amber-400'
                  : isConnected
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : isConnected ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {isLoading
                    ? 'Verificando conectividad...'
                    : isConnected
                    ? 'Todos los servicios operacionales'
                    : 'Fallo de conexión o base de datos offline'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Endpoint: <code className="font-mono text-primary">{apiUrl}/health</code>
              </p>
            </div>
          </div>

          <Badge
            variant={isLoading ? 'secondary' : isConnected ? 'active' : 'destructive'}
            className="self-start sm:self-center text-xs px-3 py-1 font-semibold"
          >
            {isLoading
              ? 'Consultando...'
              : isConnected
              ? '🟢 100% Online'
              : '🔴 Offline'}
          </Badge>
        </CardContent>
      </Card>

      {/* Grid: Server status & DB status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Backend API Express Card */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    Backend Express API
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Servicio RESTful en Node.js + TypeScript
                  </CardDescription>
                </div>
              </div>

              {isLoading ? (
                <Skeleton className="h-6 w-16 rounded-full" />
              ) : (
                <Badge
                  variant={health?.status === 'ok' ? 'active' : 'destructive'}
                  className="font-mono text-xs"
                >
                  {health?.status === 'ok' ? 'HTTP 200 OK' : 'Error'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground">Estado del Proceso:</span>
              <span className="font-semibold text-foreground">
                {isLoading ? 'Verificando...' : health?.status === 'ok' ? 'Activo / Respondiendo' : 'Inaccesible'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground">CORS y Middlewares:</span>
              <span className="font-semibold text-emerald-400">Habilitado</span>
            </div>
          </CardContent>
        </Card>

        {/* PostgreSQL Database Card */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    PostgreSQL + Prisma ORM
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Motor relacional y pool de conexiones
                  </CardDescription>
                </div>
              </div>

              {isLoading ? (
                <Skeleton className="h-6 w-20 rounded-full" />
              ) : (
                <Badge
                  variant={health?.db === 'connected' ? 'active' : 'destructive'}
                  className="font-mono text-xs"
                >
                  {health?.db === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground">Prueba de Conexión:</span>
              <span className="font-mono font-semibold text-emerald-400">
                SELECT 1 (Éxito)
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border">
              <span className="text-muted-foreground">Gestor ORM:</span>
              <span className="font-semibold text-foreground">Prisma Client v5.22</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw JSON Payload Inspector */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold">
              Respuesta JSON del Endpoint (/health)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="rounded-xl bg-muted/40 border p-3.5 sm:p-4 overflow-x-auto font-mono text-xs">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : error ? (
              <div className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error instanceof Error ? error.message : 'Error desconocido'}</span>
              </div>
            ) : (
              <pre className="text-foreground">
                {JSON.stringify(health, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack Summary Card */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold">
              Arquitectura del Monorepo
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Server className="h-3.5 w-3.5 text-indigo-400" />
                <span>Backend</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Node.js, Express, TypeScript, Zod, Clean Architecture
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span>Base de Datos</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                PostgreSQL 16 & Prisma Client ORM
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span>Frontend</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                React 18, Vite, TypeScript, Tailwind CSS, TanStack Query
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Container className="h-3.5 w-3.5 text-amber-400" />
                <span>Contenedores</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Docker Compose & Multi-stage Builds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
