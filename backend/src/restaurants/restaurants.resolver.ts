import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantModel, MenuItemModel } from './models/restaurant.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => RestaurantModel)
@UseGuards(GqlAuthGuard)
export class RestaurantsResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query(() => [RestaurantModel])
  async restaurants(
    @CurrentUser() user: any,
  ): Promise<RestaurantModel[]> {
    return this.restaurantsService.findAll(user);
  }

  @Query(() => RestaurantModel, { nullable: true })
  async restaurant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<RestaurantModel> {
    return this.restaurantsService.findOne(id, user);
  }

  @Query(() => MenuItemModel, { nullable: true })
  async menuItem(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MenuItemModel> {
    return this.restaurantsService.findMenuItem(id);
  }
}
