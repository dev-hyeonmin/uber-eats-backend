import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "../entities/user.entitiy";

@InputType()
export class EditProfileInput extends PartialType(
    PickType(User, ['email', 'password']),
) { }


@ObjectType()
export class EditProfileOutput extends CoreOutput { }