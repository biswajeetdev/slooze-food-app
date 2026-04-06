import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Country } from '../../common/enums';

@ObjectType()
export class MenuItemModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  category: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isAvailable: boolean;

  @Field()
  restaurantId: string;
}

@ObjectType()
export class RestaurantModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Country)
  country: string;

  @Field()
  cuisine: string;

  @Field()
  address: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [MenuItemModel], { nullable: true })
  menuItems?: MenuItemModel[];

  @Field()
  createdAt: Date;
}
