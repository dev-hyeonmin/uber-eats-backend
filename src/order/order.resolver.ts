import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entitiy";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";

const pubsub = new PubSub();

@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly order: OrderService
    ) { }

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    createOrder(
        @AuthUser() customer: User,
        @Args('input')
        createOrderInput: CreateOrderInput,
    ): Promise<CreateOrderOutput> {
        return this.order.createOrder(customer, createOrderInput);
    }

    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    getOrders(
        @AuthUser() user: User,
        @Args('input') getOrdersInput: GetOrdersInput
    ): Promise<GetOrdersOutput> {
        return this.order.getOrders(user, getOrdersInput);
    }

    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    getOrder(
        @AuthUser() user: User,
        @Args('input') getOrderInput: GetOrderInput
    ): Promise<GetOrderOutput> {
        return this.order.getOrder(user, getOrderInput);
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    editOrder(
        @AuthUser() user: User,
        @Args('input') editOrderInput: EditOrderInput
    ): Promise<EditOrderOutput> {
        return this.order.editOrder(user, editOrderInput);
    }

    @Mutation(returns => Boolean)
    potatoReady() {
        pubsub.publish('hotPotatos', {
            readyPotato: 'YOur potato is ready. love you.',
        });
        return true;
    }

    @Subscription(returns => String)
    @Role(['Any'])
    readyPotato(@AuthUser() user: User) {
        console.log(user);
        return pubsub.asyncIterator('hotPotatos');
    }
}
