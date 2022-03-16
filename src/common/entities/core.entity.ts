import { Field, ObjectType } from "@nestjs/graphql";
import { number } from "joi";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Field(type => number)
    id: number;

    @CreateDateColumn()
    @Field(type => Date)
    createAt: Date;

    @UpdateDateColumn()
    @Field(type => Date)
    updateAt: Date;
}