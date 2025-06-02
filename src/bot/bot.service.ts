import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Context, Markup } from "telegraf";
import { usersMainButtonsRu, usersMainButtonsUz } from "./bot.constants";
import { User } from "./models/users.model";
import { UserService } from "./users/users.service";

@Injectable()
export class BotService {
	constructor(
		@InjectModel(User) private readonly userModel: typeof User,
		private readonly userService: UserService
	) {}

	async onContact(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.userService.throwToStart(ctx);
			} else if (
				!user.phone_number &&
				user.last_state == "phone" &&
				"contact" in ctx.message!
			) {
				if (String(ctx.message.contact.user_id) == userId) {
					let phone = ctx.message.contact.phone_number;
					if (phone[0] != "+") {
						phone = "+" + phone;
					}
					user.phone_number = phone;
					user.status = true;
					user.last_state="my_survey"
					await user.save();
					await ctx.replyWithHTML(
						user.language == "uz"
							? `🚶‍♂️ Ro'yxatdan o'tish tugashiga bir qadam qoldi , hozir «Mening So'rovnomalarim» bo'limida sizni ma'lumotlaringizni aniqlashimiz uchun yordam beruvchi so'rovnomalar bor, shularga javob berishingizni so'raymiz. 
🌠 Bu ma'lumotlar sizga siz uchun qiziqarli bo'lgan mavzudagi so'rovnomalarni yuborishimizda yordam beradi va ma'lumotlaringiz sir saqlanadi 🔒`
							: `
🚶‍♂️ Регистрация в одном шаге, теперь в разделе «Мои опросы» есть опросы, которые помогут нам идентифицировать вас, мы просим вас ответить на них. 
🌠 Эта информация поможет нам отправлять вам опросы по темам, которые вам интересны, и ваша информация будет сохранена конфиденциальной 🔒`,
						{
							...Markup.keyboard(
								user.language == "uz" ? usersMainButtonsUz : usersMainButtonsRu
							).resize(),
						}
					);
				} else {
					await ctx.replyWithHTML(
						user.language == "uz"
							? `☎ O'zingizning telefon raqamingizni yuboring.`
							: `☎ Отправьте свой номер телефона.`,
						{
							...Markup.keyboard([
								Markup.button.contactRequest(
									user.language == "uz"
										? "📞 Telefon raqamni yuborish"
										: "📞 Отправить номер телефона"
								),
							]).resize(),
						}
					);
				}
			}
		} catch (error) {
			console.log("Error on onContact: ", error);
		}
	}
	async onLocation(ctx: Context) {
		try {
		} catch (error) {
			console.log(`Error on onLocation: `, error);
		}
	}
	async onText(ctx: Context) {
		try {
			await this.userService.onText(ctx);
		} catch (error) {
			console.log(`error on onText: `, error);
		}
	}
	async adminMenu(ctx: Context, menuText = `<b>Admin Menu</b>`) {
		try {
			await ctx.replyWithHTML(menuText, {
				parse_mode: "HTML",
				...Markup.keyboard([["<Master>", "<Customer>"], ["<Services>"]])
					.oneTime()
					.resize(),
			});
		} catch (error) {
			console.log(`Error on adminMenu: `, error);
		}
	}
}
