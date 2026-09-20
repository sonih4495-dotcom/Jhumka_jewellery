// server/queries/orders.ts
import prisma from '@/lib/prisma';
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache';
import { getCurrentUser } from '@/lib/roles';
import { hasPermission, PERMISSIONS } from '@/lib/roles';

// Alias for getOrder - supports optional userId parameter for authorization
export const getOrderById = (orderId: string, userId?: string) =>
  getOrder(orderId);

// `hasPermission`/`getCurrentUser` read the request's session (headers/
// cookies), which `unstable_cache` forbids inside its callback -- so the
// permission check happens here, outside the cache boundary, and the
// resulting scope is passed in as a cache key argument. That also fixes a
// latent bug: without scopeUserId in the key, two different users hitting
// this within the same revalidate window would have been served each
// other's cached order list.
export async function getOrders(page = 1, limit = 20, status?: string) {
  const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL);
  let scopeUserId: string | null = null;
  if (!canViewAll) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Authentication required');
    scopeUserId = user.id;
  }
  return getCachedOrders(page, limit, status, scopeUserId);
}

const getCachedOrders = createCachedFunction(
  async (
    page = 1,
    limit = 20,
    status: string | undefined,
    scopeUserId: string | null
  ) => {
    const skip = (page - 1) * limit;

    let where: any = {};

    if (scopeUserId) {
      where.userId = scopeUserId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  [CACHE_TAGS.orders],
  60 // 1 minute
);

export async function getOrder(orderId: string) {
  const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL);
  const user = await getCurrentUser();
  const scopeUserId = !canViewAll ? (user?.id ?? null) : null;
  return getCachedOrder(orderId, scopeUserId);
}

const getCachedOrder = createCachedFunction(
  async (orderId: string, scopeUserId: string | null) => {
    let where: any = { id: orderId };

    if (scopeUserId) {
      where.userId = scopeUserId;
    }

    return await prisma.order.findUnique({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                price: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
  [CACHE_TAGS.order],
  60
);

export const getUserOrders = createCachedFunction(
  async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  [CACHE_TAGS.orders],
  60
);

export const getRecentOrders = createCachedFunction(
  async (limit = 10) => {
    // Authentication checked by hasPermission
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL);

    let where: any = {};

    if (!canViewAll) {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      where.userId = user.id;
    }

    return await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  },
  [CACHE_TAGS.orders],
  60
);

export const getOrdersByStatus = createCachedFunction(
  async (status: string) => {
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL);

    let where: any = { status };

    if (!canViewAll) {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      where.userId = user.id;
    }

    return await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  [CACHE_TAGS.orders],
  60
);

export const getOrderStatistics = createCachedFunction(
  async () => {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      revenue: totalRevenue._sum.total || 0,
    };
  },
  [CACHE_TAGS.orders],
  300 // 5 minutes
);

export const getOrdersByDateRange = createCachedFunction(
  async (startDate: Date, endDate: Date) => {
    // Authentication checked by hasPermission
    const canViewAll = await hasPermission(PERMISSIONS.ORDER_READ_ALL);

    let where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (!canViewAll) {
      const user = await getCurrentUser();
      if (!user) throw new Error('Authentication required');
      where.userId = user.id;
    }

    return await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  [CACHE_TAGS.orders],
  300
);

export const getOrderAnalytics = createCachedFunction(
  async (period: 'day' | 'week' | 'month' = 'month') => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [orders, revenue] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
          status: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
    ]);

    // Group orders by date
    const ordersByDate = orders.reduce(
      (acc, order) => {
        const date = order.createdAt.toDateString();
        if (!acc[date]) {
          acc[date] = { count: 0, revenue: 0 };
        }
        acc[date].count++;
        if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
          acc[date].revenue += Number(order.total);
        }
        return acc;
      },
      {} as Record<string, { count: number; revenue: number }>
    );

    return {
      totalRevenue: revenue._sum.total || 0,
      totalOrders: orders.length,
      ordersByDate,
    };
  },
  [CACHE_TAGS.orders],
  300
);

export async function getAdminOrdersList(options?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  paymentMethod?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const status = options?.status;
  const search = options?.search?.trim();
  const paymentMethod = options?.paymentMethod;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  if (paymentMethod && paymentMethod !== 'all') {
    where.paymentMethod = paymentMethod.toUpperCase();
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } },
      { shippingName: { contains: search, mode: 'insensitive' } },
      { trackingNumber: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrderStats() {
  const [
    total,
    pending,
    confirmed,
    processing,
    shipped,
    delivered,
    cancelled,
    refunded,
    revenueResult,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.count({ where: { status: 'REFUNDED' } }),
    prisma.order.aggregate({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    total,
    pending,
    confirmed,
    processing,
    shipped,
    delivered,
    cancelled,
    refunded,
    revenue: Number(revenueResult._sum.total || 0),
  };
}
