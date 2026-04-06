import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

@Resolver(() => UserModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [UserModel])
  @Roles(Role.ADMIN)
  async users(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserModel, { nullable: true })
  @Roles(Role.ADMIN)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserModel> {
    return this.usersService.findOne(id);
  }
}
