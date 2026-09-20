// Location: app/admin/customers/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
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
  IndianRupee,
} from 'lucide-react';
import { getAdminCustomersList, getAdminCustomerStats } from '@/server/queries/customers';
import { CustomersDataTable } from '@/components/customers-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    sort?: 'spent' | 'orders' | 'recent';
    page?: string;
  }>;
}

async function CustomersListSection({
  searchParams,
}: {
  searchParams: Awaited<CustomersPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const role = searchParams.role || '';
  const sortBy = searchParams.sort || 'recent';

  const result = await getAdminCustomersList({
    page,
    limit: 25,
    search,
    role,
    sortBy,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <p className="text-xs text-gray-500">
          Showing <strong className="text-gray-900">{(page - 1) * 25 + 1} - {Math.min(page * 25, result.pagination.total)}</strong> of{' '}
          <strong className="text-gray-900">{result.pagination.total}</strong> registered accounts
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CustomersDataTable customers={result.customers as any} pagination={result.pagination} />
      </div>
    </div>
  );
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const currentRole = params.role || 'all';

  // Aggregate live metrics from Supabase
  const stats = await getAdminCustomerStats();

  const ROLE_TABS = [
    { label: 'All Users', value: 'all', count: stats.totalCustomers },
    { label: 'Administrators', value: 'ADMIN', count: stats.adminCount },
    { label: 'Normal Customers', value: 'USER', count: Math.max(0, stats.totalCustomers - stats.adminCount) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Customers &amp; Administrators
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Live registered customer accounts, customer lifetime spend (LTV), and admin delegation.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total Customers
            </span>
            <Users className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{stats.totalCustomers}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">● Live from Supabase</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              Admin Users
            </span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-900">{stats.adminCount}</p>
          <p className="text-[10px] text-purple-700 mt-0.5">Full admin panel access</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Store Orders
            </span>
            <ShoppingBag className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.totalOrdersCount}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Placed across all accounts</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Lifetime Revenue
            </span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Total customer spend</p>
        </div>
      </div>

      {/* Role Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Role Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ROLE_TABS.map(tab => {
            const isSelected = currentRole === tab.value;
            const searchObj = new URLSearchParams();
            if (tab.value !== 'all') searchObj.set('role', tab.value);
            if (params.search) searchObj.set('search', params.search);
            if (params.sort) searchObj.set('sort', params.sort);

            return (
              <Link
                key={tab.value}
                href={`/admin/customers${searchObj.toString() ? `?${searchObj.toString()}` : ''}`}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form method="GET" className="relative flex-1 w-full">
            {params.role && <input type="hidden" name="role" value={params.role} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <Input
              name="search"
              placeholder="Search by customer name, email, or phone..."
              defaultValue={params.search || ''}
              className="pl-9 text-xs rounded-xl bg-white border-gray-200 shadow-xs"
            />
          </form>
        </div>
      </div>

      {/* Customers Table Container */}
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-3 text-xs text-gray-500 font-semibold">Loading live customers from Supabase...</p>
          </div>
        }
      >
        <CustomersListSection searchParams={params} />
      </Suspense>
    </div>
  );
}