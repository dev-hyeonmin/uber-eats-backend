import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { Users } from "./entities/users.entitiy";
import { UserService } from "./users.service";

@Resolver()
export class UsersResolver {
    constructor(private readonly userService: UserService) { }

    @Query(returns => Users)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: Users) {
        return authUser;
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const { ok, error } = await this.userService.createAccount(createAccountInput);
            if (error) {
                return {
                    ok,
                    error
                }
            }

            return { ok }
        } catch (error) {
            return {
                "ok": false,
                error
            }
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return this.userService.login(loginInput);
        } catch (error) {
            return {
                "ok": false,
                error
            };
        }
    }
}