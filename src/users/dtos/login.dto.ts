import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Users } from "../entities/users.entitiy";

@InputType()
export class LoginInput extends PickType(Users, ['email', 'password']) { }

@ObjectType()
export class LoginOutput extends MutationOutput {
    @Field(type => String, { nullable: true })
    token?: string;
}