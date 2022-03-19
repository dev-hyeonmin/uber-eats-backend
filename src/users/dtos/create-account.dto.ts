import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Users } from "../entities/users.entitiy";

@InputType()
export class CreateAccountInput extends PickType(Users, [
    'email',
    'password',
    'role'
]) { }

@ObjectType()
export class CreateAccountOutput extends CoreOutput { }