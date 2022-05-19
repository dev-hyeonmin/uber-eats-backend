import { Res } from "@nestjs/common";
import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { User } from "src/users/entities/user.entitiy";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    Cooked = "Cooked",
    PickedUp = 'PickedUp',
    Delivered = 'Delivered',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType("OrderInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {

    @RelationId((order: Order) => order.customer)
    customerId: number;

    @Field(types => User, { nullable: true })
    @ManyToOne(type => User, user => user.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
    customer?: User;

    @RelationId((order: Order) => order.driver)
    driverId: number;


    @Field(types => User, { nullable: true })
    @ManyToOne(type => User, user => user.rides, { onDelete: 'SET NULL', nullable: true, eager: true })
    driver?: User;

    @Field(types => Restaurant)
    @ManyToOne(types => Restaurant, restaurant => restaurant.orders, { onDelete: 'SET NULL', nullable: true, eager: true })
    restaurant?: Restaurant;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem, { eager: true })
    @JoinTable()
    dishes: OrderItem[];

    @Field(type => Float, { nullable: true })
    total?: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
    @Field(type => OrderStatus)
    status: OrderStatus;
}