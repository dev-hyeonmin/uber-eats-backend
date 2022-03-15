import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurants.entity';

// https://docs.nestjs.com/graphql/mapped-types
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id'], InputType) { }


/*
* @InputType사용
* @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput
* 
* @ArgsType사용
* @Args() createRestaurantInput: CreateRestaurantInput
*/