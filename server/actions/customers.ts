// Location: server/actions/customers.ts
'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { getCurrentUser } from '@/lib/roles';

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  password?: string;
}

export async function createCustomer(data: CreateCustomerInput) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return { success: false, error: 'A customer with this email already exists' };
    }

    let hashedPassword = null;
    if (data.password && data.password.trim()) {
      hashedPassword = await bcrypt.hash(data.password.trim(), 10);
    }

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        role: data.role || 'USER',
        password: hashedPassword,
      },
    });

    revalidateTag(CACHE_TAGS.user, 'max');

    return { success: true, user };
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return { success: false, error: error.message || 'Failed to create customer' };
  }
}

export async function updateCustomer(
  userId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'USER' | 'ADMIN';
  }
) {
  try {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) updateData.phone = data.phone.trim() || null;
    if (data.role !== undefined) updateData.role = data.role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidateTag(CACHE_TAGS.user, 'max');

    return { success: true, user };
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return { success: false, error: error.message || 'Failed to update customer' };
  }
}

export async function toggleUserRole(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.id === userId) {
      return { success: false, error: 'You cannot change your own role while signed in' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidateTag(CACHE_TAGS.user, 'max');

    return { success: true, role: newRole, user: updated };
  } catch (error: any) {
    console.error('Error toggling user role:', error);
    return { success: false, error: error.message || 'Failed to toggle role' };
  }
}

export async function deleteCustomer(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.id === userId) {
      return { success: false, error: 'You cannot delete your own account while signed in' };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidateTag(CACHE_TAGS.user, 'max');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return { success: false, error: error.message || 'Failed to delete customer' };
  }
}
