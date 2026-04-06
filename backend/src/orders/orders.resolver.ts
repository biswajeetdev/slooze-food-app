import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderModel } from './models/order.model';
import { CreateOrderInput, CheckoutOrderInput } from './dto/order.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

@Resolver(() => OrderModel)
@UseGuards(GqlAuthGuard)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Query(() => [OrderModel])
  async myOrders(@CurrentUser() user: any): Promise<OrderModel[]> {
    return this.ordersService.myOrders(user.id);
  }

  @Query(() => [OrderModel])
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async orders(@CurrentUser() user: any): Promise<OrderModel[]> {
    return this.ordersService.allOrders(user.role, user.id);
  }

  @Mutation(() => OrderModel)
  async createOrder(
    @CurrentUser() user: any,
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderModel> {
    return this.ordersService.createOrder(user.id, input);
  }

  @Mutation(() => OrderModel)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async checkoutOrder(
    @CurrentUser() user: any,
    @Args('input') input: CheckoutOrderInput,
  ): Promise<OrderModel> {
    return this.ordersService.checkoutOrder(user.id, user.role, input);
  }

  @Mutation(() => OrderModel)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancelOrder(
    @CurrentUser() user: any,
    @Args('orderId', { type: () => ID }) orderId: string,
  ): Promise<OrderModel> {
    return this.ordersService.cancelOrder(user.id, user.role, orderId);
  }
}
