import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CoreEntity } from "src/common/entities/core.entity";
import { Payment } from "../entities/payments.entity";

@ObjectType()
export class GetPaymentsOutput extends CoreOutput{
    @Field(returns => [Payment], { nullable: true })
    payments?: Payment[];
}