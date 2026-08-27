import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sparkles } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Area: Mobile-First fluid padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      {/* Minimalist Responsive Footer */}
      <footer className="border-t bg-card/40 backdrop-blur text-muted-foreground text-xs py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">PromoManager KF</span>
            <span>&bull;</span>
            <span>Control de Promociones</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/promotions"
              className="hover:text-foreground transition-colors"
            >
              Promociones
            </Link>
            <Link
              to="/products"
              className="hover:text-foreground transition-colors"
            >
              Productos
            </Link>
            <Link
              to="/categories"
              className="hover:text-foreground transition-colors"
            >
              Categorías
            </Link>
            <Link
              to="/health"
              className="hover:text-foreground transition-colors"
            >
              API Status
            </Link>
          </div>

          <div className="text-muted-foreground/80 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
