import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../app.constants";
import { AdminService } from "./admins/admin.service";
import {
	adminsMainButttons,
	rewardUserForRefferalOnRegister,
	usersMainButtonsRu,
	usersMainButtonsUz,
} from "./bot.constants";
import { Referral } from "./models/refferals.model";
import { User } from "./models/users.model";
import { UserService } from "./users/users.service";

@Injectable()
export class BotService {
	constructor(
		@InjectModel(User) private readonly userModel: typeof User,
		@InjectModel(Referral) private readonly referralModel: typeof Referral,
		@InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
		private readonly userService: UserService,
		private readonly adminService: AdminService
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
					user.last_state = "my_survey";
					const referral = await this.referralModel.findOne({
						where: { reffered_user_id: userId },
					});
					if (referral) {
						const referrer = await this.userModel.findOne({
							where: { userId: referral.reffer_id },
						});
						referral.bonus_given = true;
						await referral.save();
						await this.bot.telegram.sendMessage(
							Number(referrer?.userId),
							referrer?.language == "uz"
								? `💰 Siz taklif qilgan do'stingiz ${user.username ? `<a href="https://t.me/${user.username}">${user.real_full_name}</a>` : `${user.real_full_name}`} botimizdan ro'yxatdan o'tkanligi uchun sizning hisobingizga ${rewardUserForRefferalOnRegister} so'm qo'shildi.`
								: `💰 На ваш счет было зачислено ${rewardUserForRefferalOnRegister} сумов за регистрацию приглашенного вами друга ${user.username ? `<a href="https://t.me/${user.username}">${user.real_full_name}</a>` : `${user.real_full_name}`} через нашего бота.`,
							{
								parse_mode: "HTML",
							}
						);
					}
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
			} else if (
				user.actions == "userchangingphone" &&
				"contact" in ctx.message!
			) {
				if (String(ctx.message.contact.user_id) == userId) {
					let phone = ctx.message.contact.phone_number;
					if (phone[0] != "+") {
						phone = "+" + phone;
					}
					user.phone_number = phone;
					user.actions = "";
					await user.save();
					await ctx.replyWithHTML(
						user.language == "uz"
							? `📞 Telefon raqami muvaffaqiyatli o'zgartirildi.`
							: `📞 Номер телефона успешно изменен.`,
						{
							...Markup.keyboard([
								user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
							]).resize(),
						}
					);
				} else {
					await ctx.replyWithHTML(
						user.language == "uz"
							? `☎ O'zingizning telefon raqamingizni yuboring.`
							: `☎ Отправьте свой номер телефона.`,
						{
							...Markup.keyboard(
								user.language == "uz"
									? [
											[
												Markup.button.contactRequest(
													"📞 Telefon raqamni yuborish"
												),
											],
											["🏠 Bosh menu"],
										]
									: [
											[
												Markup.button.contactRequest(
													"📞 Отправить номер телефона"
												),
											],
											["🏠 Главное меню"],
										]
							).resize(),
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
			await this.adminService.onText(ctx);
			await this.userService.onText(ctx);
		} catch (error) {
			console.log(`error on onText: `, error);
		}
	}
	async adminMenu(ctx: Context, menuText = `<b>Admin Menu</b>`) {
		try {
			await ctx.replyWithHTML(menuText, {
				parse_mode: "HTML",
				...Markup.keyboard(adminsMainButttons).oneTime().resize(),
			});
		} catch (error) {
			console.log(`Error on adminMenu: `, error);
		}
	}
}
