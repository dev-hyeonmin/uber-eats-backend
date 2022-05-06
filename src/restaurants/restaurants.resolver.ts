import { Res, SetMetadata } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entitiy';
import { AllCategoriesOutput } from './dtos/all-cateogories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOuput } from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Query(returns => RestaurantsOutput)
    restaurants(@Args('input') restaurantsInput: RestaurantsInput): Promise<RestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsInput);
    }

    @Query(returns => RestaurantOutput)
    restaurant(@Args('input') restaurantInput: RestaurantInput): Promise<RestaurantOutput> {
        return this.restaurantService.findRestaurantById(restaurantInput);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(
        @Args('input') searchRestaurantInput: SearchRestaurantInput,
    ): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
    }

    @Mutation(returns => CreateRestaurantOutput)
    //@SetMetadata('roles', UserRole.Owner)
    @Role(["Owner"])
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') createRestaurantInput: CreateRestaurantInput,
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(
            authUser,
            createRestaurantInput,
        );
    }

    @Mutation(returns => EditRestaurantOuput)
    @Role(["Owner"])
    editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput,
    ): Promise<EditRestaurantOuput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput);
    }

    @Mutation(types => DeleteRestaurantOutput)
    @Role(["Owner"])
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput);
    }
}

@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

    @ResolveField(type => Int)
    restaurantCount(@Parent() category: Category): Promise<number> {
        return this.restaurantService.countRestaurants(category);
    }

    @Query(type => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    @Query(type => CategoryOutput)
    category(
        @Args('input') categoryInput: CategoryInput,
    ): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }
}
