import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodModel } from './models/payment-method.model';
import { CreatePaymentMethodInput, UpdatePaymentMethodInput } from './dto/payment-method.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

@Resolver(() => PaymentMethodModel)
@UseGuards(GqlAuthGuard)
export class PaymentMethodsResolver {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Query(() => [PaymentMethodModel])
  async myPaymentMethods(@CurrentUser() user: any): Promise<PaymentMethodModel[]> {
    return this.paymentMethodsService.findMyPaymentMethods(user.id, user.role);
  }

  @Mutation(() => PaymentMethodModel)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createPaymentMethod(
    @CurrentUser() user: any,
    @Args('input') input: CreatePaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    return this.paymentMethodsService.create(user.id, input);
  }

  @Mutation(() => PaymentMethodModel)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @CurrentUser() user: any,
    @Args('input') input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    return this.paymentMethodsService.update(user.id, user.role, input);
  }

  @Mutation(() => PaymentMethodModel)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PaymentMethodModel> {
    return this.paymentMethodsService.remove(user.id, user.role, id);
  }
}
