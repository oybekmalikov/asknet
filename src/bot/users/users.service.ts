import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../../app.constants";
import {
	mySurveyButtonsRu,
	mySurveyButtonsUz,
	usersMainButtonsRu,
	usersMainButtonsUz,
} from "../bot.constants";
import { User } from "../models/users.model";

@Injectable()
export class UserService {
	constructor(
		@InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
		@InjectModel(User) private readonly userModel: typeof User
	) {}
	async throwToStart(ctx: Context) {
		try {
			await ctx.replyWithHTML(
				`🇺🇿 Iltimos, /start tugmasini bosing\n🇷🇺 Нажмите кнопку /start.`,
				{
					...Markup.keyboard([["/start"]]).resize(),
				}
			);
		} catch (error) {
			console.log(`Error on throw to start: `, error);
		}
	}

	async start(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (
				!user ||
				user.last_state == "lang" ||
				user.last_state == "introduction"
			) {
				await this.userModel.create({
					first_name: ctx.from?.first_name,
					last_name: ctx.from?.last_name,
					username: ctx.from?.username,
					last_state: "lang",
					userId,
				});
				await ctx.replyWithHTML(
					"🇺🇿 Assalomu aleykum, kerakli tilni tanlang.\n🇷🇺 Здравствуйте, пожалуйста, выберите нужный язык.",
					{
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `🇺🇿 O'zbekcha`,
										callback_data: `lang_uz_${userId}`,
									},
									{
										text: `🇷🇺 Русский`,
										callback_data: `lang_ru_${userId}`,
									},
								],
							],
						},
					}
				);
			} else if (user.last_state == "name" || user.last_state == "phone") {
				await this.onEnteringName(ctx);
			} else if (user.status || user.last_state == "my_survey") {
				await ctx.replyWithHTML(
					user.language == "uz"
						? `Salom ${user.real_full_name}`
						: `Привет ${user.real_full_name}`,
					{
						...Markup.keyboard(
							user.language == "uz" ? usersMainButtonsUz : usersMainButtonsRu
						).resize(),
					}
				);
			}
		} catch (error) {
			console.log("Error on start: ", error);
		}
	}
	async onText(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				if ("text" in ctx.message!) {
					const userInput = ctx.message.text;
					if (user.last_state == "name") {
						user.real_full_name = userInput;
						user.last_state = "phone";
						await user.save();
						await ctx.replyWithHTML(
							user.language == "uz"
								? `☎ Telefon raqamingizni yuboring.`
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
			}
		} catch (error) {
			console.log(`Error on user on Text: `, error);
		}
	}
	async onSelectingLang(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const userId = contextAction.split("_")[2];
			const lang = contextAction.split("_")[1];
			ctx.deleteMessage(contextMessage?.message_id);
			await this.userModel.update(
				{ language: lang, last_state: "introduction" },
				{ where: { userId } }
			);
			await ctx.replyWithHTML(
				lang == "uz"
					? `📢 Diqqat!
Quyidagi savollarda sizning ma'lumotlaringiz so‘raladi.
🛡️ Barcha ma'lumotlar maxfiy saqlanadi va faqat tahliliy maqsadlarda ishlatiladi.
❗ Davom etish orqali siz ushbu ma'lumotlarni qayta ishlashga rozilik bildirgan bo‘lasiz.

Agar rozi bo‘lsangiz, «Davom etish» tugmasini bosing.
`
					: `📢 Внимание!
Следующие вопросы запрашивают вашу информацию.
🛡️ Все данные конфиденциальны и используются только в аналитических целях.
❗ Продолжая, вы даете согласие на обработку этих данных.

Если вы согласны, нажмите «Продолжить».`,
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: lang == "uz" ? `Davom etish` : `Продолжить`,
									callback_data: "usercontinue",
								},
							],
						],
					},
				}
			);
		} catch (error) {
			console.log(`Error on selecting lang: `, error);
		}
	}
	async onEnteringName(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				user.last_state = "name";
				await user.save();
				await ctx.replyWithHTML(
					user.language == `uz`
						? `Ism va familyangizni(ixtiyoriy) kiriting ⬇️`
						: `Введите свое имя и фамилию (необязательно) ⬇️`,
					{ ...Markup.removeKeyboard() }
				);
			}
		} catch (error) {
			console.log(`Error on Name entering: `, error);
		}
	}
	async onMySurveys(ctx: Context, lang: string) {
		try {
			await ctx.replyWithHTML(
				lang == "uz"
					? `👤 Shaxsiy so'rovnomlaringizni to'ldirib bo'lgandan so'ng, siz, umumiy so'rovnomalarda ishtirok eta olasiz 🎉`
					: `👤 После завершения личных опросов вы можете принять участие в общих опросах 🎉`,
				{
					...Markup.keyboard(
						lang == "uz" ? mySurveyButtonsUz : mySurveyButtonsRu
					).resize(),
				}
			);
		} catch (error) {
			console.log(`Error on user's onMySurveys: `, error);
		}
	}
	async toMainMenu(ctx: Context, lang: string) {
		try {
			await ctx.replyWithHTML(lang == "uz" ? `📋 Menu` : `📋 Меню`, {
				...Markup.keyboard(
					lang == "uz" ? usersMainButtonsUz : usersMainButtonsRu
				).resize(),
			});
		} catch (error) {
			console.log(`Error on user's toMainMenu: `, error);
		}
	}
	async onSurveyAboutMe(ctx: Context, lang: string){
		try {
			
		} catch (error) {
			console.log(`Error on `)
		}
	}
}
