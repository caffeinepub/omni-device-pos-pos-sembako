import { ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCurrentUser } from '../features/auth/useCurrentUser';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
  Users,
  CreditCard,
  Tag,
  FileSpreadsheet,
  RefreshCw,
  Undo2,
  Warehouse,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useQueryClient } from '@tanstack/react-query';
import { t } from '../i18n/t';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const { userProfile, isAdmin } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
        <ShoppingCart className="h-5 w-5" />
        <span>{t('nav.pos')}</span>
      </Link>
      <Link to="/reports" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
        <BarChart3 className="h-5 w-5" />
        <span>{t('nav.reports')}</span>
      </Link>
      <Link to="/sync" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
        <RefreshCw className="h-5 w-5" />
        <span>{t('nav.syncStatus')}</span>
      </Link>
      {isAdmin && (
        <>
          <Link to="/catalog" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <Package className="h-5 w-5" />
            <span>{t('nav.catalog')}</span>
          </Link>
          <Link to="/inventory" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <Warehouse className="h-5 w-5" />
            <span>{t('nav.inventory')}</span>
          </Link>
          <Link to="/receiving" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span>{t('nav.receiving')}</span>
          </Link>
          <Link to="/promotions" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <Tag className="h-5 w-5" />
            <span>{t('nav.promotions')}</span>
          </Link>
          <Link to="/payment-methods" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <CreditCard className="h-5 w-5" />
            <span>{t('nav.paymentMethods')}</span>
          </Link>
          <Link to="/users" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <Users className="h-5 w-5" />
            <span>{t('nav.users')}</span>
          </Link>
          <Link to="/catalog/csv" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
            <FileSpreadsheet className="h-5 w-5" />
            <span>{t('nav.csvImportExport')}</span>
          </Link>
        </>
      )}
      <Link to="/return" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
        <Undo2 className="h-5 w-5" />
        <span>{t('nav.returns')}</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <img src="/assets/generated/pos-logo.dim_512x512.png" alt="POS" className="h-8 w-8" />
              <span className="hidden sm:inline">POS Sembako</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {identity && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile?.name || t('auth.name')}
                    <div className="text-xs text-muted-foreground font-normal">
                      {isAdmin ? t('auth.admin') : t('auth.cashier')}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/pwa-install" className="flex items-center cursor-pointer">
                      <Smartphone className="mr-2 h-4 w-4" />
                      {t('nav.pwaInstall')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4">
        {children}
      </main>

      <footer className="border-t py-6 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} POS Sembako. {t('footer.allRightsReserved')}.</div>
          <div className="flex items-center gap-1">
            {t('footer.builtWith')} <span className="text-red-500">♥</span> {t('footer.using')}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname || 'pos-sembako'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
