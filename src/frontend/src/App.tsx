import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthGate } from './features/auth/AuthGate';
import { AppLayout } from './components/AppLayout';
import { PosPage } from './features/pos/PosPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { ReceivingPage } from './features/inventory/ReceivingPage';
import { UsersPage } from './features/admin/UsersPage';
import { PaymentMethodsPage } from './features/payments/PaymentMethodsPage';
import { TransactionDetailsPage } from './features/transactions/TransactionDetailsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SyncStatusPage } from './features/sync/SyncStatusPage';
import { PromotionsPage } from './features/promotions/PromotionsPage';
import { ProductCsvPage } from './features/catalog/ProductCsvPage';
import { ReturnFlowPage } from './features/returns/ReturnFlowPage';
import { PwaInstallGuidePage } from './features/pwa/PwaInstallGuidePage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { IdleLock } from './features/auth/IdleLock';

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <IdleLock>
        <AppLayout>
          <OfflineIndicator />
          <Outlet />
        </AppLayout>
      </IdleLock>
    </AuthGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PosPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryPage,
});

const receivingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receiving',
  component: ReceivingPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});

const paymentMethodsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-methods',
  component: PaymentMethodsPage,
});

const transactionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transaction/$id',
  component: TransactionDetailsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

const syncRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sync',
  component: SyncStatusPage,
});

const promotionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/promotions',
  component: PromotionsPage,
});

const csvRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog/csv',
  component: ProductCsvPage,
});

const returnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/return',
  component: ReturnFlowPage,
});

const pwaInstallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pwa-install',
  component: PwaInstallGuidePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  checkoutRoute,
  catalogRoute,
  inventoryRoute,
  receivingRoute,
  usersRoute,
  paymentMethodsRoute,
  transactionRoute,
  reportsRoute,
  syncRoute,
  promotionsRoute,
  csvRoute,
  returnRoute,
  pwaInstallRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
