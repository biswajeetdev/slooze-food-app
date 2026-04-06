import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodInput, UpdatePaymentMethodInput } from './dto/payment-method.input';
import { Role } from '../common/enums';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findMyPaymentMethods(userId: string, userRole: string) {
    // Admins and Managers can see all payment methods (company-wide pool for checkout).
    // Members only see their own (though they can't checkout).
    const where = userRole === Role.ADMIN || userRole === Role.MANAGER
      ? {}
      : { userId };
    return this.prisma.paymentMethod.findMany({
      where,
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: string, input: CreatePaymentMethodInput) {
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: { ...input, userId },
    });
  }

  async update(userId: string, userRole: string, input: UpdatePaymentMethodInput) {
    const pm = await this.prisma.paymentMethod.findUnique({ where: { id: input.id } });
    if (!pm) throw new NotFoundException('Payment method not found');

    if (pm.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot modify another user\'s payment method');
    }

    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: pm.userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id: input.id },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
    });
  }

  async remove(userId: string, userRole: string, id: string) {
    const pm = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');

    if (pm.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot delete another user\'s payment method');
    }

    return this.prisma.paymentMethod.delete({ where: { id } });
  }
}
