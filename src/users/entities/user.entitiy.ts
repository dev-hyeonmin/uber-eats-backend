import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsString } from "class-validator";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";

export enum UserRole {
    Client = "Client",
    Owner = "Owner",
    Delivery = "Delivery"
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column({ unique: true })
    @Field(type => String)
    email: string;

    @Column({ select: false })
    @Field(type => String)
    @IsString()
    password: string;

    @Column()
    @Field(type => UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @UpdateDateColumn()
    @Field(type => Date)
    lastLogin: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (error) {
                console.log(error);
                throw new InternalServerErrorException();
            }
        }
    }

    @Field(type => [Restaurant], { nullable: true })
    @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
    restaurants: Restaurant[]

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const ok = await bcrypt.compare(aPassword, this.password);
            return ok;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}