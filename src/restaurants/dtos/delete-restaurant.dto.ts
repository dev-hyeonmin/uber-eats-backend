import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";

@InputType()
export class DeleteRestaurantInput {
    @Field(types => Number)
    restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput { }
