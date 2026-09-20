// Location: components/customers-data-table.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Heart,
  ExternalLink,
  Search,
  Eye,
  Check,
  Copy,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  createCustomer,
  updateCustomer,
  toggleUserRole,
  deleteCustomer,
} from '@/server/actions/customers';
import { useToast } from '@/components/ui/use-toast';

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string | Date;
  totalSpent: number;
  orderCount: number;
  wishlistCount: number;
  authProvider: string;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string | Date;
  }>;
}

interface CustomersDataTableProps {
  customers: AdminCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function CustomersDataTable({ customers: initialCustomers, pagination }: CustomersDataTableProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<AdminCustomer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Add customer form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit customer form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isUpdating, setIsUpdating] = useState(false);

  // General loading & copy
  const [togglingId, setTogglingId] = useState<string | null>(null);
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    setIsCreating(true);
    try {
      const res = await createCustomer({
        name: newName,
        email: newEmail,
        phone: newPhone || undefined,
        role: newRole,
        password: newPassword || undefined,
      });

      if (res.success && res.user) {
        const created: AdminCustomer = {
          id: res.user.id,
          name: res.user.name || newName,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          createdAt: res.user.createdAt,
          totalSpent: 0,
          orderCount: 0,
          wishlistCount: 0,
          authProvider: 'email',
          recentOrders: [],
        };

        setCustomers(prev => [created, ...prev]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewPassword('');
        setNewRole('USER');

        toast({
          title: 'Customer Created',
          description: `Account for ${created.name} (${created.email}) was created in Supabase.`,
        });
      } else {
        toast({
          title: 'Failed to create customer',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create customer',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (cust: AdminCustomer) => {
    setSelectedCustomer(cust);
    setEditName(cust.name);
    setEditEmail(cust.email);
    setEditPhone(cust.phone || '');
    setEditRole(cust.role);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setIsUpdating(true);
    try {
      const res = await updateCustomer(selectedCustomer.id, {
        name: editName,
        email: editEmail,
        phone: editPhone || undefined,
        role: editRole,
      });

      if (res.success && res.user) {
        setCustomers(prev =>
          prev.map(c =>
            c.id === selectedCustomer.id
              ? {
                  ...c,
                  name: editName,
                  email: editEmail,
                  phone: editPhone || null,
                  role: editRole,
                }
              : c
          )
        );
        setIsEditModalOpen(false);
        toast({
          title: 'Customer Updated',
          description: `Profile details for ${editName} updated in Supabase.`,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update customer',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRole = async (cust: AdminCustomer) => {
    setTogglingId(cust.id);
    const targetRole = cust.role === 'ADMIN' ? 'USER' : 'ADMIN';

    try {
      const res = await toggleUserRole(cust.id);
      if (res.success) {
        setCustomers(prev =>
          prev.map(c => (c.id === cust.id ? { ...c, role: targetRole } : c))
        );
        toast({
          title: 'User Role Changed',
          description: `${cust.name} is now an ${targetRole}.`,
        });
      } else {
        toast({
          title: 'Action Denied',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to change role',
        variant: 'destructive',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const res = await deleteCustomer(selectedCustomer.id);
      if (res.success) {
        setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
        setIsDeleteModalOpen(false);
        setIsDetailsOpen(false);
        toast({
          title: 'Customer Deleted',
          description: `Account for ${selectedCustomer.name} has been removed.`,
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
        description: err?.message || 'Failed to delete customer',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Customer Directory</h3>
          <p className="text-[11px] text-gray-500">Manage user accounts and admin privilege delegations.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-stone-900 hover:bg-black text-xs font-bold gap-1.5 shadow-sm"
        >
          <UserPlus className="h-4 w-4" /> Add New Customer
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] uppercase font-bold text-gray-600">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Contact Info</th>
              <th className="px-5 py-4">Account Role</th>
              <th className="px-5 py-4">Orders Placed</th>
              <th className="px-5 py-4">Lifetime Spend (LTV)</th>
              <th className="px-5 py-4">Registered Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {customers.map(cust => (
              <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                {/* Customer Name & Avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 font-bold text-white shadow-xs text-sm">
                      {cust.name ? cust.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsDetailsOpen(true);
                        }}
                        className="font-bold text-gray-900 hover:text-rose-600 hover:underline truncate block text-xs"
                      >
                        {cust.name}
                      </button>
                      <span className="text-[10px] text-gray-400 font-mono block truncate">
                        ID: {cust.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </td>

                {/* Email & Phone */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate max-w-[150px]">{cust.email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(cust.email, cust.id + '-email')}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        {copiedId === cust.id + '-email' ? (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </button>
                    </div>
                    {cust.phone ? (
                      <div className="flex items-center gap-1 text-gray-500 font-mono text-[10px]">
                        <Phone className="h-3 w-3 text-gray-400" /> +91 {cust.phone}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">No phone set</span>
                    )}
                  </div>
                </td>

                {/* Role & 1-Click Role Switcher */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={cust.role === 'ADMIN' ? 'default' : 'secondary'}
                      className={
                        cust.role === 'ADMIN'
                          ? 'bg-purple-600 text-white font-bold hover:bg-purple-600'
                          : 'bg-gray-100 text-gray-700 font-bold'
                      }
                    >
                      {cust.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={togglingId === cust.id}
                      onClick={() => handleToggleRole(cust)}
                      className="h-6 px-2 text-[10px] rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 font-semibold"
                      title={cust.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                    >
                      {cust.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                    </Button>
                  </div>
                </td>

                {/* Orders count */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                    <span>{cust.orderCount}</span>
                  </div>
                </td>

                {/* Total Spent */}
                <td className="px-5 py-4 font-extrabold text-sm text-gray-900">
                  {formatCurrency(cust.totalSpent)}
                </td>

                {/* Registered Date */}
                <td className="px-5 py-4 text-gray-500">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setIsDetailsOpen(true);
                      }}
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                      title="View Customer Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(cust)}
                      className="h-8 w-8 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                      title="Edit Customer Details"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-8 w-8 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL 1: Add New Customer ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
          <form onSubmit={handleCreateCustomer}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-rose-600" />
                Add New Customer Account
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Register a customer or create a backend administrator directly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Full Name *</Label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Kashish Parekh"
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Email Address *</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="kashish@example.com"
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">WhatsApp / Mobile Number (Optional)</Label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9898243000"
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">System Role *</Label>
                <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">👤 Normal Customer (USER)</SelectItem>
                    <SelectItem value="ADMIN">👑 Store Administrator (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Password (Optional)</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave empty for magic link login"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !newEmail.trim()}
                className="rounded-xl bg-stone-900 text-white hover:bg-black text-xs font-bold"
              >
                {isCreating ? 'Creating Account...' : 'Create Account ✨'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: Edit Customer Details ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-rose-600" />
                Edit Profile: {selectedCustomer?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Update account info and permissions in Supabase.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Full Name *</Label>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Email Address *</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Mobile Number</Label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))}
                  className="rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-semibold text-gray-700">Role</Label>
                <Select value={editRole} onValueChange={(val: any) => setEditRole(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">👤 Normal Customer (USER)</SelectItem>
                    <SelectItem value="ADMIN">👑 Store Administrator (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editEmail.trim()}
                className="rounded-xl bg-stone-900 text-white hover:bg-black text-xs font-bold"
              >
                {isUpdating ? 'Saving...' : 'Save Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: View Customer Profile & Orders History ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-3xl">
          {selectedCustomer && (
            <div className="space-y-6">
              <DialogHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 font-bold text-white shadow-sm text-base">
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedCustomer.name}
                    </DialogTitle>
                    <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
              </DialogHeader>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Spend</span>
                  <p className="mt-1 text-base font-black text-rose-600">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Orders</span>
                  <p className="mt-1 text-base font-black text-gray-900">{selectedCustomer.orderCount}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Wishlist</span>
                  <p className="mt-1 text-base font-black text-purple-600">{selectedCustomer.wishlistCount} items</p>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  Recent Orders Placed ({selectedCustomer.recentOrders.length})
                </span>
                {selectedCustomer.recentOrders.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-xs">
                    No orders placed yet by this customer.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                    {selectedCustomer.recentOrders.map(ord => (
                      <div key={ord.id} className="flex items-center justify-between p-3.5 text-xs">
                        <div>
                          <p className="font-mono font-bold text-gray-900">{ord.orderNumber}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(Number(ord.total))}</p>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    openEditModal(selectedCustomer);
                  }}
                  className="rounded-xl bg-stone-900 text-white hover:bg-black text-xs font-bold"
                >
                  Edit Profile
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: Delete Confirmation ── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm p-6 bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account for {selectedCustomer?.name}?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 pt-1">
              This will permanently delete this customer account and credentials. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteCustomer}
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
