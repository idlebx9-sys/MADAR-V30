import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTrpcClient } from './lib/trpc.ts';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { Home } from './pages/Home.tsx';
import { PublicSite } from './pages/PublicSite.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { SiteBuilder } from './pages/SiteBuilder.tsx';
import { AdminPanel } from './pages/AdminPanel.tsx';
import { ClientDashboard } from './pages/ClientDashboard.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { NotFound } from './pages/NotFound.tsx';

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/site/:subdomain" component={PublicSite} />
              <Route path="/builder" component={SiteBuilder} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/portal" component={ClientDashboard} />
              <Route path="/my-requests" component={ClientDashboard} />
              <Route path="/admin" component={AdminPanel} />
              <Route component={NotFound} />
            </Switch>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
