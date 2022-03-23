import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
    static forRoot(option: MailModuleOptions): DynamicModule {
        return {
            module: MailModule,
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: option,
                },
                MailService
            ],
            exports: [MailService],
        };
    }
}
