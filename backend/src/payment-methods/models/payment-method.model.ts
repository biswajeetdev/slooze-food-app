import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodModel {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  last4?: string;

  @Field()
  isDefault: boolean;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;
}
