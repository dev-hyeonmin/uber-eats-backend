import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entitiy";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment";
import { Payment } from "./entities/payments.entity";
import { PaymentService } from "./payments.service";

@Resolver(of => Payment)
export class PaymentResolver {
    constructor(
        private readonly payment:PaymentService,
    ) { }
    
    @Mutation(returns => CreatePaymentOutput)
    @Role(['Owner'])
    createPayment(
        @AuthUser() owner: User,
        @Args('input') createPaymentInput: CreatePaymentInput
    ):Promise<CreatePaymentOutput> {
        return this.payment.createPayment(owner, createPaymentInput);
    }
}