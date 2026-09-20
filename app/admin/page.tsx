// Location: app/admin/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ShoppingBag,
  Package,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    orders,
    recentCustomers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: true,
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: { select: { id: true, total: true } },
      },
    }),
  ]);

  // Aggregate total revenue
  const revenueResult = await prisma.order.aggregate({
    where: {
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _sum: {
      total: true,
    },
  });

  const totalRevenue = Number(revenueResult._sum.total || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Jhumka Junction Admin
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-0">
              ● Supabase Live
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time jewellery store sales, customers, and product inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="rounded-xl bg-gray-900 text-xs font-bold text-white hover:bg-black shadow-sm">
            <Link href="/admin/inventory">
              <Package className="mr-1.5 h-4 w-4" /> Products &amp; Inventory
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> 3% GST included
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{totalOrders}</p>
          <Link href="/admin/orders" className="text-xs text-rose-600 hover:underline mt-1 block">
            Manage orders →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Customers
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{totalUsers}</p>
          <Link href="/admin/customers" className="text-xs text-purple-600 hover:underline mt-1 block">
            View all customers →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Live Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{totalProducts}</p>
          <Link href="/admin/inventory" className="text-xs text-amber-600 hover:underline mt-1 block">
            Manage catalog &amp; stock →
          </Link>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Recent Customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Orders */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-500">Latest transactions from store checkout</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-rose-600">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </div>

          {!orders.length ? (
            <p className="text-xs text-gray-400 py-8 text-center">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.user?.name || order.shippingName || order.customerEmail || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.orderItems.length} items • {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(order.total))}</p>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Customers</h2>
              <p className="text-xs text-gray-500">New registered user profiles</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-purple-600">
              <Link href="/admin/customers">View All</Link>
            </Button>
          </div>

          {!recentCustomers.length ? (
            <p className="text-xs text-gray-400 py-8 text-center">No registered customers yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentCustomers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 text-white font-bold text-xs">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {customer.name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}