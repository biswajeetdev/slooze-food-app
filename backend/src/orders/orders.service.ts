import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput, CheckoutOrderInput } from './dto/order.input';
import { Role } from '../common/enums';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private orderInclude = {
    user: { select: { id: true, email: true, name: true, role: true, country: true, createdAt: true } },
    restaurant: { include: { menuItems: true } },
    items: { include: { menuItem: true } },
    paymentMethod: true,
  };

  async createOrder(userId: string, input: CreateOrderInput) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: input.restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== Role.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('Cannot order from a restaurant outside your country');
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: input.items.map((i) => i.menuItemId) },
        restaurantId: input.restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== input.items.length) {
      throw new BadRequestException('One or more menu items are invalid or unavailable');
    }

    const itemsData = input.items.map((i) => {
      const item = menuItems.find((m) => m.id === i.menuItemId);
      return { menuItemId: i.menuItemId, quantity: i.quantity, price: item.price };
    });

    const total = itemsData.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return this.prisma.order.create({
      data: {
        userId,
        restaurantId: input.restaurantId,
        total,
        items: { create: itemsData },
      },
      include: this.orderInclude,
    });
  }

  async checkoutOrder(userId: string, userRole: string, input: CheckoutOrderInput) {
    if (userRole === Role.MEMBER) {
      throw new ForbiddenException('Members cannot checkout orders');
    }

    const order = await this.prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot checkout another user\'s order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(`Cannot checkout an order with status: ${order.status}`);
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: input.paymentMethodId },
    });
    if (!paymentMethod) throw new NotFoundException('Payment method not found');
    // Admin-created payment methods are company-wide; Admin/Manager can use any.
    // Members can't reach this code (blocked above).

    return this.prisma.order.update({
      where: { id: input.orderId },
      data: { status: 'COMPLETED', paymentMethodId: input.paymentMethodId },
      include: this.orderInclude,
    });
  }

  async cancelOrder(userId: string, userRole: string, orderId: string) {
    if (userRole === Role.MEMBER) {
      throw new ForbiddenException('Members cannot cancel orders');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot cancel another user\'s order');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: this.orderInclude,
    });
  }

  async myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: this.orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async allOrders(userRole: string, userId: string) {
    if (userRole === Role.ADMIN) {
      return this.prisma.order.findMany({
        include: this.orderInclude,
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.myOrders(userId);
  }
}
