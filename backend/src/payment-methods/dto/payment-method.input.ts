import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsNotEmpty()
  @IsIn(['CARD', 'UPI', 'BANK_TRANSFER'])
  type: string;

  @Field()
  @IsNotEmpty()
  label: string;

  @Field({ nullable: true })
  @IsOptional()
  last4?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isDefault: boolean;
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  label?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
