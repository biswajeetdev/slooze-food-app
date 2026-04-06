import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Country, Role } from '../../common/enums';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field(() => Role, { defaultValue: Role.MEMBER })
  @IsEnum(Role)
  role: Role;

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;
}
