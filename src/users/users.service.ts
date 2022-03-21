import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entitiy";
import * as jwt from "jsonwebtoken";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/user-edit.dto";
import { Verification } from "./entities/verification.entity";

@Injectable() // 주사(주입) 가능한
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService,
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
        try {
            const isExists = await this.users.findOne({ email });
            if (isExists) {
                return { ok: false, error: "There is a user with that email already" };
            }

            const user = await this.users.save(this.users.create({ email, password, role }));
            await this.verifications.save(this.verifications.create({ user }));
            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create user" };
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<User> {
        const user = await this.users.findOne(userId);
        if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.save(this.verifications.create({ user }));
        }
        if (password) {
            user.password = password;
        }

        return this.users.save(user);

        /*
            return this.users.update(userId, { ...editProfileInput });
            해당 경우 update시 패스워드가 암호화 되지 않고 평서문으로 들어간다.
            @BeforeUpdate() 가 작동하지 않는 이유는 update 함수 설명에 보면
            우리가 entitiy를 보내고 있는것이 아니라 query를 보내고 있어 그렇다.
            따라서 save함수를 사용해준다.
            :: save() -> 해당 데이터가 있을 경우 update, 없다면 insert
        */
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

    async findById(id: number): Promise<User> {
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