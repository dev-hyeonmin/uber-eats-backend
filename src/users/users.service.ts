import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entitiy";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/user-edit.dto";
import { Verification } from "./entities/verification.entity";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "src/mail/mail.service";

@Injectable() // 주사(주입) 가능한
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verifications: Repository<Verification>,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) { }

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOne({ id });
            if (user) {
                return {
                    ok: true,
                    user
                }
            }
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                error: "User Not Found"
            }
        }
    }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const isExists = await this.users.findOne({ email });
            if (isExists) {
                return { ok: false, error: "There is a user with that email already" };
            }

            const user = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verifications.save(this.verifications.create({ user }));
            //this.mailService.sendVerificationEmail(user.email, verification.code);
            this.mailService.sendMailer(user.email);
            return { ok: true };
        } catch (e) {
            return { ok: false, error: "Couldn't create user" };
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne(userId);
            if (email) {
                user.email = email;
                user.verified = false;
                const verification = await this.verifications.save(this.verifications.create({ user }));
                //this.mailService.sendVerificationEmail(user.email, verification.code);
                this.mailService.sendMailer(user.email);
            }
            if (password) {
                user.password = password;
            }

            await this.users.save(user);

            return {
                ok: true
            }
        } catch (error) {
            return {
                ok: false,
                error
            }
        }

        /*
            return this.users.update(userId, { ...editProfileInput });
            해당 경우 update시 패스워드가 암호화 되지 않고 평서문으로 들어간다.
            @BeforeUpdate() 가 작동하지 않는 이유는 update 함수 설명에 보면
            우리가 entitiy를 보내고 있는것이 아니라 query를 보내고 있어 그렇다.
            따라서 save함수를 사용해준다.
            :: save() -> 해당 데이터가 있을 경우 update, 없다면 insert
        */
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const user = await this.users.findOne({ email }, { select: ['id', 'password'] });
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

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verifications.findOne({ code }, { relations: ['user'] });
            if (verification) {
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.verifications.delete(verification.id);
                return { ok: true };
            }
            throw new Error();
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                error
            };
        }
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