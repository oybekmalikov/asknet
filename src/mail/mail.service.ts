import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { Client } from "../clients/models/client.model";

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}
	async sendMail(client: Client) {
		const url = `${process.env.API_HOST}/api/clients/activate/${client.activation_link}`;
		await this.mailerService.sendMail({
			to: client.email,
			subject: "“So‘rovnoma.uz” sahifasiga xush kelibsiz",
			html: `<h1>Salom! Hurmatli ${client.full_name},</h1>
			<h2>Tasdiqlash uchun pastga bosing</h2>
			<p>
				<a href="${url}">Tasdiqlash</a>
			</p> `,
		});
	}
}
