import { SetMetadata } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entitiy';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOuput } from './dtos/edit-restaurant.dto';
import { RestaurantService } from './restaurants.service';

@Resolver()
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) { }

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
}