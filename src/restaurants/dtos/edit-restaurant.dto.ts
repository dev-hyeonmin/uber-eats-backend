import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { number } from "joi";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CreateRestaurantInput } from "./create-restaurant.dto";

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
    @Field(type => Number)
    restaurantId: number;
}

@ObjectType()
export class EditRestaurantOuput extends CoreOutput { }