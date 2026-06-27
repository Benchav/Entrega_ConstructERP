import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; 
import { LogOut, Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DynamicSidebar } from './DynamicSidebar';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <DynamicSidebar />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold text-foreground hidden sm:block">ConstructERP</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
            <User className="h-4 w-4 text-secondary-foreground" />
            <span className="text-sm font-medium text-secondary-foreground">{user?.nombre}</span>
            <span className="text-xs text-muted-foreground">({user?.rol})</span>
          </div>
          <Button variant="outline" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
