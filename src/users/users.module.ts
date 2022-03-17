import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entitiy';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    providers: [UserService, UsersResolver],
    exports: [UserService],
})
export class UsersModule { }

// ConfigService :: .env파일을 로드해옵니다. path를 기반으로 configuration 값(custom configuration 또는 환경 변수)을 가져옵니다.