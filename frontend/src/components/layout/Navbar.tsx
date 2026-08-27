import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  LayoutDashboard,
  Tag,
  Package,
  FolderTree,
  Activity,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HealthResponse {
  status: string;
  db: string;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Promociones', path: '/promotions', icon: Tag },
  { name: 'Productos', path: '/products', icon: Package },
  { name: 'Categorías', path: '/categories', icon: FolderTree },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // API Health status query
  const { data: healthData, isError, isLoading } = useQuery<HealthResponse>({
    queryKey: ['api-health-navbar'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) throw new Error('API offline');
      return res.json();
    },
    refetchInterval: 15000, // Check every 15s
    retry: 1,
  });

  const isOnline = !isError && healthData?.status === 'ok' && healthData?.db === 'connected';

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                  PromoManager KF
                </span>
                <span className="text-[10px] text-muted-foreground leading-none font-medium">
                  Control Center
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* API Health Indicator Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/health">
                  <div
                    className={cn(
                      'hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 cursor-pointer',
                      isLoading
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : isOnline
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isLoading
                          ? 'bg-amber-400 animate-pulse'
                          : isOnline
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'bg-rose-400 animate-ping'
                      )}
                    />
                    <span className="font-mono">
                      {isLoading ? 'Verificando...' : isOnline ? 'API Online' : 'API Offline'}
                    </span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {isOnline
                    ? 'Conexión activa con Express y PostgreSQL (Prisma).'
                    : 'Servidor no disponible o base de datos desconectada.'}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 flex flex-col justify-between">
                  <div className="space-y-6">
                    <SheetHeader className="text-left border-b pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <SheetTitle className="font-bold text-base">
                          PromoManager KF
                        </SheetTitle>
                      </div>
                    </SheetHeader>

                    {/* Mobile Nav Links */}
                    <nav className="flex flex-col space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              )
                            }
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </NavLink>
                        );
                      })}

                      <NavLink
                        to="/health"
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )
                        }
                      >
                        <Activity className="h-4 w-4" />
                        Estado del Servidor
                      </NavLink>
                    </nav>
                  </div>

                  {/* Mobile Footer Status */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Estado del backend:</span>
                      <Badge
                        variant={isOnline ? 'active' : 'destructive'}
                        className="text-[10px]"
                      >
                        {isOnline ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
