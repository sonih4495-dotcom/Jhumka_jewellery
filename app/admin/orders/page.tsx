// Location: app/admin/orders/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { getAdminOrdersList, getAdminOrderStats } from '@/server/queries/orders';
import { OrdersDataTable } from '@/components/orders-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}

async function OrdersListSection({
  searchParams,
}: {
  searchParams: Awaited<AdminOrdersPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const status = searchParams.status || '';
  const search = searchParams.search || '';
  const payment = searchParams.payment || '';

  const result = await getAdminOrdersList({
    page,
    limit: 25,
    status,
    search,
    paymentMethod: payment,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <p className="text-xs text-gray-500">
          Showing <strong className="text-gray-900">{(page - 1) * 25 + 1} - {Math.min(page * 25, result.pagination.total)}</strong> of{' '}
          <strong className="text-gray-900">{result.pagination.total}</strong> orders
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <OrdersDataTable
          orders={result.orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            subtotal: Number(order.subtotal || 0),
            discount: Number(order.discount || 0),
            tax: Number(order.tax || 0),
            shipping: Number(order.shipping || 0),
            total: Number(order.total || 0),
            paymentMethod: order.paymentMethod,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            shippingName: order.shippingName,
            shippingAddress: order.shippingAddress,
            shippingLandmark: order.shippingLandmark,
            shippingCity: order.shippingCity,
            shippingState: order.shippingState,
            shippingZip: order.shippingZip,
            courierPartner: order.courierPartner,
            trackingNumber: order.trackingNumber,
            notes: order.notes,
            createdAt: order.createdAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            user: order.user,
            orderItems: order.orderItems.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: Number(item.price || 0),
              productName: item.productName || item.product?.name || 'Product',
              productSku: item.productSku || item.product?.sku || null,
              product: item.product,
            })),
          }))}
          pagination={result.pagination}
        />
      </div>
    </div>
  );
}

export default async function AdminOrdersPage(props: AdminOrdersPageProps) {
  const searchParams = await props.searchParams;
  const currentStatus = searchParams.status || 'all';

  // Fetch real-time live aggregations from database
  const stats = await getAdminOrderStats();

  const STATUS_TABS = [
    { label: 'All Orders', value: 'all', count: stats.total },
    { label: 'Pending', value: 'PENDING', count: stats.pending },
    { label: 'Confirmed', value: 'CONFIRMED', count: stats.confirmed },
    { label: 'Processing', value: 'PROCESSING', count: stats.processing },
    { label: 'Shipped', value: 'SHIPPED', count: stats.shipped },
    { label: 'Delivered', value: 'DELIVERED', count: stats.delivered },
    { label: 'Cancelled', value: 'CANCELLED', count: stats.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Orders &amp; Shipments
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Live order fulfillment, tracking management, and customer deliveries from Supabase.
          </p>
        </div>
      </div>

      {/* Quick Live Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Orders</span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Live from Supabase</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.pending}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Awaiting verification</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">In Transit</span>
            <Truck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-900">{stats.shipped}</p>
          <p className="text-[10px] text-purple-700 mt-0.5">Dispatched via Courier</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.delivered}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Successfully completed</p>
        </div>

        <div className="col-span-2 sm:col-span-1 lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Revenue</span>
            <IndianRupee className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(stats.revenue)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Net completed revenue</p>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_TABS.map(tab => {
            const isSelected = currentStatus === tab.value;
            const searchObj = new URLSearchParams();
            if (tab.value !== 'all') searchObj.set('status', tab.value);
            if (searchParams.search) searchObj.set('search', searchParams.search);

            return (
              <Link
                key={tab.value}
                href={`/admin/orders${searchObj.toString() ? `?${searchObj.toString()}` : ''}`}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'border-stone-900 shadow-sm'
                    : 'border-gray-200 hover:border-stone-900'
                }`}
                style={{
                  backgroundColor: isSelected ? '#181716' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#374151',
                }}
              >
                <span>{tab.label}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : '#f3f4f6',
                    color: isSelected ? '#ffffff' : '#4b5563',
                  }}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form method="GET" className="relative flex-1 w-full">
            {searchParams.status && (
              <input type="hidden" name="status" value={searchParams.status} />
            )}
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <Input
              name="search"
              placeholder="Search by Order #, Customer name, email, phone, tracking..."
              defaultValue={searchParams.search || ''}
              className="pl-9 text-xs rounded-xl bg-white border-gray-200 shadow-xs"
            />
          </form>
        </div>
      </div>

      {/* Orders Table Container */}
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-3 text-xs text-gray-500 font-semibold">Loading live orders from Supabase...</p>
          </div>
        }
      >
        <OrdersListSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
