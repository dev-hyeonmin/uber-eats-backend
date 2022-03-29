import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entitiy";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service"

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
}

const mockMailService = {
    sendVerificationEmail: jest.fn()
}

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
    let service: UserService;
    let userRepository: MockRepository;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                }
            ],
        }).compile();
        service = module.get<UserService>(UserService);
        userRepository = module.get(getRepositoryToken(User));
    });

    it('be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAccount', () => {
        it('should fail if user exists', async () => {
            userRepository.findOne.mockResolvedValue({
                id: 1,
                email: "test@gmail.com"
            });

            const result = await service.createAccount({
                email: "",
                password: "",
                role: 0
            });

            expect(result).toMatchObject({
                ok: false,
                error: "There is a user with that email already"
            })

        });
    });

    it.todo('findById');
    it.todo('editProfile');
    it.todo('login');
    it.todo('verifyEmail');
})