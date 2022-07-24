import { Inject } from "@nestjs/common";
import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { User } from "src/users/entities/user.entitiy";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";


@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly order: OrderService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
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
    potatoReady(@Args('potatoId') potatoId: number) {
        this.pubSub.publish('hotPotatos', {
            readyPotato: potatoId
        });
        return true;
    }

    @Mutation(returns => TakeOrderOutput)
    takeOrder(
        @AuthUser() driver: User,
        @Args('input') takeOrderInput: TakeOrderInput
    ): Promise<TakeOrderOutput> {
        return this.order.takeOrder(driver, takeOrderInput);
    }

    // resolve : 사용자가 받는 update 알람의 형태를 변경해주는 역할.
    @Subscription(returns => Order, {
        filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
            return ownerId === user.id;
        },
        resolve: ({ pendingOrders: { order } }) => {
            return order;
        }
    })
    @Role(['Owner'])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
    }

    @Subscription(returns => Order)
    @Role(['Delivery'])
    coockedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
    }

    @Subscription(returns => Order, {
        filter: (
            { orderUpdates: order }: { orderUpdates: Order },
            { input }: { input: OrderUpdatesInput },
            { user }: { user: User },
        ) => {
            if (
                order.driverId !== user.id &&
                order.customerId !== user.id &&
                order.restaurant.ownerId !== user.id
            ) {
                return false;
            }
            return order.id === input.id;
        }
    })
    @Role(['Any'])
    orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
    }
}
