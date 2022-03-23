import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {
        //console.log(this.option);
        /*this.sendMail("잠온다.", "강의만 들으면 잠이옴 웃김.").then(() => {
            console.log("Message sent");
        }).catch((error) => {
            console.log(error.response.body);
        });*/
    }

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
        this.sendMail('Verify Your Email', 'confirm',
            [
                { "key": "username", "value": email },
                { "key": "code", "value": code }
            ]
        );
    }
}
