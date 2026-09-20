// Location: components/orders-data-table.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  updateOrderStatus,
  updateOrderTracking,
  deleteOrder,
} from '@/server/actions/orders';
import { useToast } from '@/components/ui/use-toast';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingLandmark?: string | null;
  shippingCity: string;
  shippingState?: string | null;
  shippingZip: string;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  shippedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
  } | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    productName: string;
    productSku?: string | null;
    product?: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
      slug: string;
    } | null;
  }>;
}

interface OrdersDataTableProps {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const COURIER_PARTNERS = [
  'Delhivery',
  'BlueDart',
  'DTDC',
  'Shiprocket',
  'India Post (Speed Post)',
  'Ekart Logistics',
  'Shadowfax',
  'XpressBees',
];

export function OrdersDataTable({ orders: initialOrders, pagination }: OrdersDataTableProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Tracking form state
  const [courierPartner, setCourierPartner] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  // General loading
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied to clipboard',
      description: text,
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => (prev ? { ...prev, status: newStatus } : null));
        }
        toast({
          title: 'Order Status Updated',
          description: `Order has been marked as ${newStatus}.`,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: res.error || 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openTrackingModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setCourierPartner(order.courierPartner || 'Delhivery');
    setTrackingNumber(order.trackingNumber || '');
    setTrackingNotes(order.notes || '');
    setIsTrackingModalOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setIsUpdatingTracking(true);
    try {
      const res = await updateOrderTracking(
        selectedOrder.id,
        courierPartner,
        trackingNumber.trim(),
        trackingNotes.trim() || undefined,
        true // mark as SHIPPED
      );

      if (res.success) {
        setOrders(prev =>
          prev.map(o =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: 'SHIPPED',
                  courierPartner,
                  trackingNumber: trackingNumber.trim(),
                  notes: trackingNotes.trim() || o.notes,
                }
              : o
          )
        );
        setSelectedOrder(prev =>
          prev
            ? {
                ...prev,
                status: 'SHIPPED',
                courierPartner,
                trackingNumber: trackingNumber.trim(),
                notes: trackingNotes.trim() || prev.notes,
              }
            : null
        );
        setIsTrackingModalOpen(false);
        toast({
          title: 'Tracking Details Updated',
          description: `Shipment tracking saved. Order is now SHIPPED.`,
        });
      } else {
        toast({
          title: 'Failed to update tracking',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to save tracking',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      const res = await deleteOrder(selectedOrder.id);
      if (res.success) {
        setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
        setIsDeleteModalOpen(false);
        setIsDetailsOpen(false);
        toast({
          title: 'Order Deleted',
          description: `Order ${selectedOrder.orderNumber} has been removed.`,
        });
      } else {
        toast({
          title: 'Delete Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: AdminOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold hover:bg-amber-100">⏳ Pending</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-bold hover:bg-blue-100">✓ Confirmed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 font-bold hover:bg-indigo-100">⚙️ Processing</Badge>;
      case 'SHIPPED':
        return <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-bold hover:bg-purple-100">🚚 Shipped</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold hover:bg-emerald-100">🎁 Delivered</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold hover:bg-rose-100">❌ Cancelled</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-stone-100 text-stone-900 border-stone-300 font-bold hover:bg-stone-100">↩️ Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (method: string) => {
    if (method === 'UPI') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-bold text-purple-700">
          <QrCode className="h-3 w-3" /> UPI
        </span>
      );
    }
    if (method === 'COD') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          <Banknote className="h-3 w-3" /> Cash on Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-bold text-stone-700">
        <CreditCard className="h-3 w-3" /> {method}
      </span>
    );
  };

  if (!orders.length) {
    return (
      <div className="p-16 text-center text-gray-500">
        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="font-bold text-lg text-gray-900">No Orders Found</p>
        <p className="text-xs text-gray-500 mt-1">Orders placed by customers will appear here in real time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] uppercase font-bold text-gray-600">
            <tr>
              <th className="px-5 py-4">Order # / Date</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Payment &amp; Total</th>
              <th className="px-5 py-4">Fulfillment Status</th>
              <th className="px-5 py-4">Shipment Tracking</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map(order => {
              const itemCount = order.orderItems.reduce((sum, it) => sum + it.quantity, 0);

              return (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Order Number & Date */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                          }}
                          className="font-mono font-bold text-gray-900 hover:text-rose-600 hover:underline flex items-center gap-1"
                        >
                          {order.orderNumber}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderNumber, order.id)}
                          className="text-gray-400 hover:text-gray-700"
                          title="Copy Order ID"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </td>

                  {/* Customer Contact */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 truncate max-w-[140px]">
                        {order.shippingName || order.user?.name || 'Customer'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate max-w-[150px]">{order.customerEmail}</p>
                      {order.customerPhone && (
                        <p className="text-[10px] text-gray-400 font-mono">+91 {order.customerPhone}</p>
                      )}
                    </div>
                  </td>

                  {/* Ordered Items Preview */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.orderItems.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative h-9 w-9 overflow-hidden rounded-lg border-2 border-white bg-gray-100 shrink-0 shadow-xs"
                          >
                            {item.product?.images?.[0]?.url ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.productName}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="m-auto h-4 w-4 text-gray-400 mt-2" />
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">
                        {itemCount} {itemCount === 1 ? 'pc' : 'pcs'}
                      </span>
                    </div>
                  </td>

                  {/* Payment & Amount */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </p>
                      {getPaymentBadge(order.paymentMethod)}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-5 py-4">
                    <Select
                      defaultValue={order.status}
                      onValueChange={val => handleStatusChange(order.id, val)}
                      disabled={updatingOrderId === order.id}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs font-semibold rounded-xl bg-white border-gray-200 shadow-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">⏳ Pending</SelectItem>
                        <SelectItem value="CONFIRMED">✓ Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">⚙️ Processing</SelectItem>
                        <SelectItem value="SHIPPED">🚚 Shipped</SelectItem>
                        <SelectItem value="DELIVERED">🎁 Delivered</SelectItem>
                        <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                        <SelectItem value="REFUNDED">↩️ Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Tracking */}
                  <td className="px-5 py-4">
                    {order.trackingNumber ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-purple-700 text-[11px] flex items-center gap-1">
                          <Truck className="h-3 w-3" /> {order.courierPartner || 'Courier'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] text-gray-600 truncate max-w-[110px]">
                            {order.trackingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.trackingNumber!, order.id + '-track')}
                            className="text-gray-400 hover:text-gray-700"
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTrackingModal(order)}
                        className="h-7 px-2.5 text-[11px] rounded-lg border-dashed border-gray-300 text-gray-600 hover:border-gray-900"
                      >
                        + Add Tracking
                      </Button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsOpen(true);
                        }}
                        className="h-8 w-8 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                        title="View Full Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsInvoiceOpen(true);
                        }}
                        className="h-8 w-8 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                        title="Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openTrackingModal(order)}
                        className="h-8 w-8 text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                        title="Update Shipment & Tracking"
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MODAL 1: Complete Order Details Inspection ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-3xl">
          {selectedOrder && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-gray-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Order #{selectedOrder.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 mt-0.5">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentBadge(selectedOrder.paymentMethod)}
                  </div>
                </div>
              </DialogHeader>

              {/* Customer & Delivery Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-gray-50/80 p-4 border border-gray-200/80 text-xs">
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 block">
                    Customer Information
                  </span>
                  <p className="font-bold text-gray-900">{selectedOrder.shippingName}</p>
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> {selectedOrder.customerEmail}
                  </p>
                  {selectedOrder.customerPhone && (
                    <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                      <Phone className="h-3.5 w-3.5 text-gray-400" /> +91 {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 block">
                    Delivery Address (India)
                  </span>
                  <p className="text-gray-800 leading-relaxed">
                    {selectedOrder.shippingAddress}
                    {selectedOrder.shippingLandmark && `, Landmark: ${selectedOrder.shippingLandmark}`}
                    <br />
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState} -{' '}
                    <span className="font-mono font-bold text-gray-900">{selectedOrder.shippingZip}</span>
                  </p>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 block">
                  Ordered Items ({selectedOrder.orderItems.length})
                </span>
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          {item.product?.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <Package className="m-auto h-5 w-5 text-gray-300 mt-3" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate text-xs">{item.productName}</p>
                          <p className="text-[11px] text-gray-500">
                            Qty: <strong className="text-gray-900">{item.quantity}</strong> × {formatCurrency(Number(item.price))}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-xs shrink-0">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-2xl bg-gray-50/70 p-4 border border-gray-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(Number(selectedOrder.subtotal))}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- {formatCurrency(Number(selectedOrder.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping &amp; Delivery</span>
                  <span className="text-emerald-600 font-bold">
                    {Number(selectedOrder.shipping) > 0 ? formatCurrency(Number(selectedOrder.shipping)) : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST / Taxes</span>
                  <span className="text-emerald-600 font-semibold">₹0 (Zero Extra Tax)</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1">
                  <span>Total Amount</span>
                  <span className="text-base font-black text-rose-600">{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {/* Order Tracking & Shipment Status */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                    <Truck className="h-4 w-4 text-purple-600" /> Shipment &amp; Logistics
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      openTrackingModal(selectedOrder);
                    }}
                    className="h-7 text-xs rounded-xl bg-white border-purple-200 text-purple-800 hover:bg-purple-100"
                  >
                    Edit Tracking
                  </Button>
                </div>
                {selectedOrder.trackingNumber ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Courier Partner:</span>
                      <span className="font-bold text-gray-900">{selectedOrder.courierPartner || 'Delhivery'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">AWB / Tracking Number:</span>
                      <span className="font-mono font-bold text-purple-800">{selectedOrder.trackingNumber}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="col-span-2 pt-1 border-t border-purple-100">
                        <span className="text-gray-500 text-[10px] block">Notes:</span>
                        <span className="text-gray-700">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs italic">No tracking number assigned yet.</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-xl text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Order
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setIsInvoiceOpen(true);
                    }}
                    className="rounded-xl text-xs"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Invoice
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsDetailsOpen(false)}
                    className="rounded-xl bg-stone-900 text-xs font-bold"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: Shipment & Tracking Manager ── */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Update Shipment Tracking
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Assign courier partner and tracking ID to notify customer and mark as SHIPPED.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700">Courier Partner *</Label>
              <Select value={courierPartner} onValueChange={setCourierPartner}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Courier" />
                </SelectTrigger>
                <SelectContent>
                  {COURIER_PARTNERS.map(partner => (
                    <SelectItem key={partner} value={partner}>
                      {partner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700">Tracking / AWB / Consignment Number *</Label>
              <Input
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. 142859103948"
                className="font-mono text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700">Dispatch Notes / Remarks (Optional)</Label>
              <Input
                value={trackingNotes}
                onChange={e => setTrackingNotes(e.target.value)}
                placeholder="Dispatched from Ahmedabad hub via Express Air"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTrackingModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTracking}
              disabled={isUpdatingTracking || !trackingNumber.trim()}
              className="rounded-xl bg-purple-700 hover:bg-purple-800 text-xs font-bold"
            >
              {isUpdatingTracking ? 'Saving...' : 'Save & Mark Shipped 🚚'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: Printable Tax Invoice Receipt ── */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-white rounded-2xl print:p-0">
          {selectedOrder && (
            <div id="printable-invoice" className="space-y-6 text-stone-900 font-sans">
              {/* Boutique Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-stone-900">
                    Jhumka<span className="text-rose-600">Junction</span>
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">Boutique Handcrafted Oxidised Jewellery</p>
                  <p className="text-[10px] text-stone-400">Ahmedabad, Gujarat, India • GSTIN: 24AAACJ1234F1Z5</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-stone-900 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    Tax Invoice / Bill of Supply
                  </span>
                  <p className="text-xs font-mono font-bold text-stone-900 mt-2">#{selectedOrder.orderNumber}</p>
                  <p className="text-[10px] text-stone-500">
                    Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Billed / Shipped To:</span>
                  <p className="font-bold text-stone-900">{selectedOrder.shippingName}</p>
                  <p className="text-stone-600">{selectedOrder.shippingAddress}</p>
                  {selectedOrder.shippingLandmark && <p className="text-stone-500">Landmark: {selectedOrder.shippingLandmark}</p>}
                  <p className="text-stone-600">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingZip}
                  </p>
                  <p className="text-stone-500">Phone: +91 {selectedOrder.customerPhone || 'N/A'}</p>
                  <p className="text-stone-500">Email: {selectedOrder.customerEmail}</p>
                </div>

                <div className="space-y-1 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Order Information:</span>
                  <p><span className="text-stone-500">Payment Mode:</span> <strong className="text-stone-900">{selectedOrder.paymentMethod}</strong></p>
                  <p><span className="text-stone-500">Order Status:</span> <strong className="text-stone-900">{selectedOrder.status}</strong></p>
                  {selectedOrder.trackingNumber && (
                    <p><span className="text-stone-500">Courier:</span> <strong className="text-stone-900">{selectedOrder.courierPartner} ({selectedOrder.trackingNumber})</strong></p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-stone-200">
                <thead className="bg-stone-100 border-b border-stone-200 font-bold text-stone-700">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{item.productName}</td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono">{formatCurrency(Number(item.price))}</td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(Number(selectedOrder.subtotal))}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Discount:</span>
                      <span className="font-mono">- {formatCurrency(Number(selectedOrder.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {Number(selectedOrder.shipping) > 0 ? formatCurrency(Number(selectedOrder.shipping)) : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST (Included):</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1">
                    <span>Grand Total:</span>
                    <span className="font-mono font-black text-rose-600 text-base">
                      {formatCurrency(Number(selectedOrder.total))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400">
                <p>Thank you for shopping handcrafted jewellery with Jhumka Junction! ✨</p>
                <p className="mt-0.5">For support or returns, contact support@jhumkajunction.com</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 print:hidden">
                <Button variant="outline" size="sm" onClick={() => setIsInvoiceOpen(false)} className="rounded-xl text-xs">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl bg-stone-900 text-xs font-bold"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / Save as PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: Delete Order Confirmation ── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm p-6 bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Order #{selectedOrder?.orderNumber}?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 pt-1">
              This action cannot be undone. If this order was active, its inventory quantities will be automatically restored.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteOrder}
              className="rounded-xl text-xs font-bold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
