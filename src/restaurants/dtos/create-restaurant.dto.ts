import { Field, InputType, ObjectType, OmitType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from 'src/users/entities/user.entitiy';
import { Restaurant } from '../entities/restaurants.entity';

// https://docs.nestjs.com/graphql/mapped-types
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'coverImage', 'address']) {
    @Field(type => String)
    categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput { }


/*
* @InputType사용
* @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput
* 
* @ArgsType사용
* @Args() createRestaurantInput: CreateRestaurantInput
*/