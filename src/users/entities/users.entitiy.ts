import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from "@nestjs/common";

enum UserRole {
    Client,
    Owner,
    Delivery
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Users extends CoreEntity {
    @Column()
    @Field(type => String)
    email: string;

    @Column()
    @Field(type => String)
    password: string;

    @Column()
    @Field(type => UserRole)
    role: UserRole;

    @UpdateDateColumn()
    @Field(type => Date)
    lastLogin: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

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