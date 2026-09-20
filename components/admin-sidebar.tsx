// Location: components/admin-sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Sparkles,
  Image as ImageIcon,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/inventory', label: 'Products & Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/media', label: 'Media & Reels', icon: ImageIcon },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavLinks = (isMobile = false) => (
    <nav className="mt-4 px-3 space-y-1">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all',
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-amber-400' : 'text-gray-400')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const renderUserFooter = () => (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="truncate mr-2">
          <p className="text-xs font-bold text-gray-900 truncate">
            {user.name || 'Admin User'}
          </p>
          <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-amber-400 font-black text-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-black tracking-tight text-gray-900">
            Jhumka<span className="text-rose-600">Admin</span>
          </span>
        </Link>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open navigation menu">
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-white flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-gray-100">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-amber-400 font-black text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-black tracking-tight text-gray-900">
                    Jhumka<span className="text-rose-600">Admin</span>
                  </span>
                </SheetTitle>
              </div>
              {renderNavLinks(true)}
            </div>
            {renderUserFooter()}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col justify-between h-full shadow-sm shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-amber-400 font-black text-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-base font-black tracking-tight text-gray-900">
                  Jhumka<span className="text-rose-600">Admin</span>
                </span>
                <p className="text-[10px] text-gray-400 font-medium">Store Management</p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          {renderNavLinks(false)}
        </div>

        {/* User Footer */}
        {renderUserFooter()}
      </aside>
    </>
  );
}