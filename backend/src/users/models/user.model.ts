import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Country, Role } from '../../common/enums';

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => Role)
  role: string;

  @Field(() => Country)
  country: string;

  @Field()
  createdAt: Date;
}
