import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CoreEntity } from "src/common/entities/core.entity";
import { Users } from "../entities/users.entitiy";

@InputType()
export class EditProfileInput extends PartialType(
    PickType(Users, ['email', 'password']),
) { }


@ObjectType()
export class EditProfileOutput extends CoreOutput { }