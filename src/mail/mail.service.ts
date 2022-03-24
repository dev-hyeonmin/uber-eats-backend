import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
        private readonly mailerService: MailerService,
    ) { }

    // 1. mailgun
    private async sendMail(subject: string, template: string, emailVars: EmailVar[]) {
        var form = new FormData();
        form.append("from", `Excited User <mailgun@${this.options.domain}>`);
        form.append("to", `hyeonminroh@gmail.com`);
        form.append("subject", subject);
        form.append("template", template);

        emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
        try {
            const response = await got(
                `https://api.mailgun.net/v3/${this.options.domain}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${Buffer.from(
                            `api:${this.options.apiKey}`,
                        ).toString('base64')}`,
                    },
                    body: form,
                },
            );
        } catch (error) {
            console.log(error);
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendMail('Verify Your Email', 'verify-email',
            [
                { key: 'code', value: code },
                { key: 'username', value: email },
            ]
        );
    }

    // 2. nestJs 
    sendMailer(receiver: string): void {
        this.mailerService
            .sendMail({
                to: 'hyeonminroh@gmail.com', // list of receivers
                from: this.options.fromEmail, // sender address
                subject: 'Verify Your Email', // Subject line
                html: `Please Confrim Your Email.<br>Hello ${receiver} :)<br>Please confirm your account!<br>Thanks for choosing Nuber eats<br><a href="http://127.0.0.1:3000/confirm?code={{code}}">Click Here to Confirm</a>`, // HTML body content
            })
            .then(() => { console.log("sended"); })
            .catch((e) => { console.log(e); });
    }
}
