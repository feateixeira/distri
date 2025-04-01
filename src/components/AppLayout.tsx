
import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutGrid, 
  Package, 
  ShoppingCart, 
  BarChart, 
  LogOut, 
  Menu, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const { logout, isAdmin, user } = useAuth();

  const navItems = [
    { icon: LayoutGrid, label: 'Painel', path: '/dashboard', admin: true },
    { icon: Package, label: 'Produtos', path: '/produtos' },
    { icon: Package, label: 'Estoque', path: '/estoque' },
    { icon: ShoppingCart, label: 'Vendas', path: '/vendas' },
  ].filter(item => !item.admin || isAdmin);

  return (
    <div className={cn("bg-sidebar p-4 flex flex-col h-full", className)}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sidebar-primary">Distri Bebidas</h1>
        <p className="text-sidebar-foreground text-sm">Sistema de Gestão</p>
      </div>
      
      <nav className="space-y-1 mb-8 flex-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex items-center px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md w-full text-left transition-colors"
          >
            <Icon size={18} className="mr-2" />
            {label}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <div className="flex items-center mb-4 px-4">
          <User size={18} className="mr-2 text-sidebar-foreground" />
          <div>
            <p className="text-sidebar-foreground font-medium">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/70">
              {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
            </p>
          </div>
        </div>
        <Button 
          onClick={logout} 
          variant="outline" 
          className="flex items-center w-full"
        >
          <LogOut size={16} className="mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

const MobileHeader: React.FC = () => {
  return (
    <div className="bg-white p-4 flex items-center shadow-sm md:hidden h-16">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <h1 className="text-xl font-bold ml-3">Distri Bebidas</h1>
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <div className="sidebar-area hidden md:block">
        <Sidebar className="h-full" />
      </div>
      
      <div className="header-area">
        <MobileHeader />
      </div>
      
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};
