// Location: app/admin/customers/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
  }>;
}

async function CustomersList({ search, role }: { search?: string; role?: string }) {
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role && role !== 'all') {
    where.role = role.toUpperCase();
  }

  const customers = await prisma.user.findMany({
    where,
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
      wishlists: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!customers.length) {
    return (
      <div className="p-12 text-center text-gray-500">
        <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="font-semibold text-base">No customers found</p>
        <p className="text-xs text-gray-400 mt-1">Try refining your search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50/75 text-xs uppercase font-semibold text-gray-600">
          <tr>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Contact</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Orders</th>
            <th className="px-6 py-4">Total Spent</th>
            <th className="px-6 py-4">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {customers.map(customer => {
            const totalSpent = customer.orders.reduce(
              (sum, order) => sum + Number(order.total || 0),
              0
            );

            return (
              <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                {/* Customer Details */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 font-bold text-white shadow-sm text-sm">
                      {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {customer.name || 'Unnamed Customer'}
                        {customer.role === 'ADMIN' && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">ID: {customer.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <Badge
                    variant={customer.role === 'ADMIN' ? 'default' : 'secondary'}
                    className={
                      customer.role === 'ADMIN'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {customer.role}
                  </Badge>
                </td>

                {/* Orders count */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                    {customer.orders.length}
                  </div>
                  {customer.wishlists.length > 0 && (
                    <div className="text-[11px] text-gray-400">
                      {customer.wishlists.length} wishlist items
                    </div>
                  )}
                </td>

                {/* Total Spent */}
                <td className="px-6 py-4 font-bold text-gray-900">
                  {formatCurrency(totalSpent)}
                </td>

                {/* Joined date */}
                <td className="px-6 py-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;

  // Aggregate stats from live DB
  const [totalCustomers, adminCount, totalOrdersCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.order.count(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Customers &amp; Users
          </h1>
          <p className="text-sm text-gray-500">
            Live registered customer accounts linked with your Supabase database.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Customers
            </span>
            <Users className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{totalCustomers}</p>
          <p className="text-xs text-emerald-600 mt-1">● Synced live with Supabase</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Admin Users
            </span>
            <ShieldCheck className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{adminCount}</p>
          <p className="text-xs text-gray-400 mt-1">Full system management access</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Store Orders
            </span>
            <ShoppingBag className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{totalOrdersCount}</p>
          <p className="text-xs text-gray-400 mt-1">Placed across all accounts</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <form method="GET" className="relative max-w-sm flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            name="search"
            placeholder="Search by name, email or phone..."
            defaultValue={params.search || ''}
            className="pl-9 bg-white"
          />
        </form>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Suspense
          fallback={
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-3 text-xs text-gray-500">Loading customers from database...</p>
            </div>
          }
        >
          <CustomersList search={params.search} role={params.role} />
        </Suspense>
      </div>
    </div>
  );
}