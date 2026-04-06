import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../common/enums';
import { UserModel } from '../../users/models/user.model';
import { RestaurantModel, MenuItemModel } from '../../restaurants/models/restaurant.model';
import { PaymentMethodModel } from '../../payment-methods/models/payment-method.model';

@ObjectType()
export class OrderItemModel {
  @Field(() => ID)
  id: string;

  @Field(() => MenuItemModel)
  menuItem: MenuItemModel;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType()
export class OrderModel {
  @Field(() => ID)
  id: string;

  @Field(() => UserModel)
  user: UserModel;

  @Field(() => RestaurantModel)
  restaurant: RestaurantModel;

  @Field(() => [OrderItemModel])
  items: OrderItemModel[];

  @Field(() => OrderStatus)
  status: string;

  @Field(() => Float)
  total: number;

  @Field(() => PaymentMethodModel, { nullable: true })
  paymentMethod?: PaymentMethodModel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
