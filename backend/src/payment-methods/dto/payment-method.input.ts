import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsBoolean, IsIn, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsNotEmpty()
  @IsIn(['CARD', 'UPI', 'BANK_TRANSFER'])
  type: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'last4 must be exactly 4 digits' })
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
  @MaxLength(100)
  label?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
