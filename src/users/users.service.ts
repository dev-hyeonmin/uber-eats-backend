import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { Users } from "./entities/users.entitiy";
import * as jwt from "jsonwebtoken";
import { JwtService } from "src/jwt/jwt.service";

@Injectable() // 주사(주입) 가능한
export class UserService {
    constructor(
        @InjectRepository(Users)
        private readonly users: Repository<Users>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
        try {
            const isExists = await this.users.findOne({ email });
            if (isExists) {
                return { ok: false, error: "There is a user with that email already" };
            }

            await this.users.save(this.users.create({ email, password, role }));
            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create user" };
        }
    }

    async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
        try {
            const user = await this.users.findOne({ email });
            if (!user) {
                return {
                    ok: false,
                    error: "User not found."
                }
            }

            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: 'Wrong password',
                };
            }

            this.users.update(user.id, { "lastLogin": this.getNow() });
            return {
                ok: true,
                token: this.jwtService.sign(user.id),
            };
        } catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }

    async findById(id: number): Promise<Users> {
        return this.users.findOne({ id });
    }

    private getNow(): string {
        let today = new Date();

        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let date = today.getDate();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let seconds = today.getSeconds();

        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}:00`;
    }
}