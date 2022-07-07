import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/users/entities/user.entitiy';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    @IsString()
    coverImage?: string;

    @Field(type => String)
    @Column()
    @IsString()
    address: string;

    @Field(type => Boolean)
    @Column({default: false})
    isPromoted: boolean;

    @Field(type => Date, { nullable: true })
    @Column({ nullable: true })
    promotedUntil: Date;

    @Field(type => Category, { nullable: true })
    @ManyToOne(
      type => Category,
      category => category.restaurants,
      { nullable: true, onDelete: 'SET NULL', eager: true },
    )
    category: Category;

    @Field(type => User)
    @ManyToOne(
        () => User,
        (User) => User.restaurants,
        { onDelete: 'CASCADE' }
    )
    owner: User;

    @RelationId((restuarant: Restaurant) => restuarant.owner)
    ownerId: number;

    @Field(type => [Order])
    @OneToMany(
        type => Order,
        order => order.restaurant,
    )
    orders: Order[];

    @Field(type => [Dish])
    @OneToMany(
        type => Dish,
        dish => dish.restaurant,
    )
    menu: Dish[];
}