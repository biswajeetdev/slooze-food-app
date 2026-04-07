import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { Country } from '../../common/enums';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Field()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  // Role is NOT accepted from the client — all self-registrations are MEMBER.
  // Admins must be promoted via a separate admin-only mutation or directly in the DB.

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
