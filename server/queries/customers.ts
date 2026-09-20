// Location: server/queries/customers.ts
import prisma from '@/lib/prisma';

export async function getAdminCustomersList(options?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: 'spent' | 'orders' | 'recent';
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const search = options?.search?.trim();
  const role = options?.role;
  const sortBy = options?.sortBy || 'recent';
  const skip = (page - 1) * limit;

  const where: any = {};

  if (role && role !== 'all') {
    where.role = role.toUpperCase();
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
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
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const customers = users.map(user => {
    const totalSpent = user.orders.reduce(
      (sum, order) => sum + (['CANCELLED', 'REFUNDED'].includes(order.status) ? 0 : Number(order.total || 0)),
      0
    );
    const orderCount = user.orders.length;
    const authProvider = user.accounts?.[0]?.provider || 'email';

    return {
      id: user.id,
      name: user.name || 'Customer',
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      createdAt: user.createdAt,
      totalSpent,
      orderCount,
      wishlistCount: user.wishlists.length,
      authProvider,
      recentOrders: user.orders.slice(0, 5),
    };
  });

  // Client-requested in-memory sort if needed
  if (sortBy === 'spent') {
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sortBy === 'orders') {
    customers.sort((a, b) => b.orderCount - a.orderCount);
  }

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
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
      },
      wishlists: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              slug: true,
            },
          },
        },
      },
      accounts: true,
    },
  });

  if (!user) return null;

  const totalSpent = user.orders.reduce(
    (sum, order) => sum + (['CANCELLED', 'REFUNDED'].includes(order.status) ? 0 : Number(order.total || 0)),
    0
  );

  return {
    ...user,
    totalSpent,
  };
}

export async function getAdminCustomerStats() {
  const [totalCustomers, adminCount, totalOrdersCount, revenueResult] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    totalCustomers,
    adminCount,
    totalOrdersCount,
    totalRevenue: Number(revenueResult._sum.total || 0),
  };
}
