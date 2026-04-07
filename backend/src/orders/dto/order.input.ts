import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, IsOptional, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  @IsNotEmpty()
  menuItemId: string;

  @Field(() => Int)
  @Min(1)
  @Max(50) // Prevent absurdly large quantities
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  @IsNotEmpty()
  restaurantId: string;

  @Field(() => [OrderItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20) // Prevent orders with hundreds of line items
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}

@InputType()
export class CheckoutOrderInput {
  @Field(() => ID)
  @IsNotEmpty()
  orderId: string;

  @Field(() => ID)
  @IsNotEmpty()
  paymentMethodId: string;
}
