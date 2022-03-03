import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurants.dto';
import { Restaurant } from './entities/restaurants.entity';

@Resolver()
export class RestaurantResolver {
    @Query(returns => [Restaurant])
    restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
        return [];
    }

    @Mutation(returns => Boolean)
    createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
        console.log(createRestaurantDto);
        return true;
    }
}