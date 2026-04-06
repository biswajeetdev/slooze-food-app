import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Re-BAC: Country-based access control.
 * Users can only operate within their assigned country.
 * ADMINs bypass this restriction.
 */
@Injectable()
export class CountryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) throw new ForbiddenException('Not authenticated');

    // ADMINs can access all countries
    if (user.role === 'ADMIN') return true;

    const args = ctx.getArgs();
    const restaurantCountry = args.country;

    // If no country filter is being applied, allow (service layer will filter)
    if (!restaurantCountry) return true;

    if (restaurantCountry !== user.country) {
      throw new ForbiddenException(
        `Access denied. You can only access resources in your country: ${user.country}`,
      );
    }

    return true;
  }
}
