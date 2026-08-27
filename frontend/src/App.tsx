import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { HomePage } from './pages/HomePage';
import { HealthPage } from './pages/HealthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main promotions management dashboard */}
          <Route path="/" element={<HomePage />} />

          {/* Server & DB Health check view */}
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </BrowserRouter>
      {/* Global Toast Notifications */}
      <Toaster richColors position="top-right" closeButton theme="dark" />
    </QueryClientProvider>
  );
};

export default App;
