import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { Users } from "./entities/users.entitiy";
import { UserService } from "./users.service";

@Resolver()
export class UsersResolver {
    constructor(private readonly userService: UserService) { }

    @Query(returns => Users)
    me(@Context() context) {
        if (context.user) {
            return context.user;
        } else {
            return;
        }
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