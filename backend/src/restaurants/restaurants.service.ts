import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country, Role } from '../common/enums';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: { role: string; country: string }) {
    const where =
      user.role === Role.ADMIN ? {} : { country: user.country as Country };

    return this.prisma.restaurant.findMany({
      where,
      include: { menuItems: { where: { isAvailable: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, user: { role: string; country: string }) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: { where: { isAvailable: true } } },
    });

    if (!restaurant) return null;

    if (user.role !== Role.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException(
        'You can only view restaurants in your country',
      );
    }

    return restaurant;
  }

  async findMenuItem(id: string) {
    return this.prisma.menuItem.findUnique({ where: { id } });
  }
}
