import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './components/theme-provider';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { HealthPage } from './pages/HealthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="promo-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <Routes>
              {/* Global Layout with responsive Navbar and Footer */}
              <Route element={<MainLayout />}>
                {/* 1. Dashboard / Overview */}
                <Route path="/" element={<DashboardPage />} />

                {/* 2. Promotions Management */}
                <Route path="/promotions" element={<PromotionsPage />} />

                {/* 3. Products Catalog */}
                <Route path="/products" element={<ProductsPage />} />

                {/* 4. Categories Management */}
                <Route path="/categories" element={<CategoriesPage />} />

                {/* 5. Server & DB Health Status */}
                <Route path="/health" element={<HealthPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          {/* Global Toast Notifications */}
          <Toaster richColors position="top-right" closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
