import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as fs from "fs";
import { InjectBot } from "nestjs-telegraf";
import { join } from "path";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../app.constants";
import { District } from "../district/models/district.model";
import { QuestionAnswer } from "../question_answers/models/question_answer.model";
import { QuestionLogic } from "../question_logics/models/question_logic.model";
import { Question } from "../questions/models/question.model";
import { Region } from "../region/models/region.model";
import { Survey } from "../surveys/models/survey.model";
import { AdminService } from "./admins/admin.service";
import {
	adminsMainButttons,
	rewardUserForRefferalOnRegister,
	usersMainButtonsRu,
	usersMainButtonsUz,
} from "./bot.constants";
import { Referral } from "./models/refferals.model";
import { Response } from "./models/responses.model";
import { User } from "./models/users.model";
import { UserService } from "./users/users.service";
@Injectable()
export class BotService {
	constructor(
		@InjectModel(User) private readonly userModel: typeof User,
		@InjectModel(Response) private readonly responseModel: typeof Response,
		@InjectModel(Survey) private readonly surveyModel: typeof Survey,
		@InjectModel(QuestionLogic)
		private readonly questionLogicModel: typeof QuestionLogic,
		@InjectModel(Question) private readonly questionModel: typeof Question,
		@InjectModel(Region) private readonly regionModel: typeof Region,
		@InjectModel(District) private readonly districtModel: typeof District,
		@InjectModel(QuestionAnswer)
		private readonly questionAnswerModel: typeof QuestionAnswer,
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
			if ("location" in ctx.message!) {
				const userId = String(ctx.from?.id);
				const user = await this.userModel.findOne({ where: { userId } });
				if (!user) {
					await this.userService.throwToStart(ctx);
				} else {
					if (user.actions.startsWith("survey_")) {
						const [text, surveyId, questionId, logicId, userId] =
							user.actions.split("_");
						const userInput = `${ctx.message.location.latitude}|${ctx.message.location.longitude}`;
						await this.responseModel.create({
							participant_id: user.id,
							question_id: +questionId,
							response: userInput,
							response_time: new Date().toISOString(),
						});
						const logic = await this.questionLogicModel.findOne({
							where: { question_id: +questionId },
						});
						const survey = await this.surveyModel.findOne({
							where: { id: +surveyId },
						});
						if (logic?.status == "end_survey") {
							user.actions = "";
							user.save();
							await this.userService.endOfSurvey(ctx, user, survey!);
							return;
						} else if (
							logic?.status == "skip_to" ||
							logic?.status == "start_survey"
						) {
							const question = await this.questionModel.findOne({
								where: { id: logic.next_question_id },
							});
							if (!question) {
								await this.userService.endOfSurvey(ctx, user, survey!);
								return;
							} else {
								const answers = await this.questionAnswerModel.findAll({
									where: { question_id: question!.id },
									order: [["id", "ASC"]],
								});
								if (!answers.length && question.field_type == "region") {
									const regions = await this.regionModel.findAll();
									const regionbtn: any = [];
									const temp: any = [];
									for (const ans of regions) {
										temp.push({
											text: user.language == "uz" ? ans.name_uz : ans.name_ru,
											callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
										});
										if (temp.length == 2) {
											regionbtn.push([...temp]);
											temp.length = 0;
										}
									}
									if (temp.length == 1) {
										regionbtn.push([...temp]);
										temp.length = 0;
									}
									await ctx.reply("Rahmat! Endi keyingi savol...", {
										...Markup.removeKeyboard(),
									});
									await ctx.replyWithHTML(
										user.language == "uz"
											? question.title_uz
											: question.title_ru,
										{
											reply_markup: {
												inline_keyboard: regionbtn,
											},
										}
									);
									return;
								}
								if (!answers.length && question.field_type != "text") {
									await this.userService.endOfSurvey(ctx, user, survey!);
									return;
								} else {
									if (question.field_type == "text") {
										user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
										await user.save();
										if (!question.image) {
											await ctx.reply("Rahmat! Endi keyingi savol...", {
												...Markup.removeKeyboard(),
											});
											await ctx.replyWithHTML(
												user.language == "uz"
													? question.title_uz
													: question.title_ru,
												{ ...Markup.removeKeyboard() }
											);
										} else {
											const { Input } = require("telegraf");
											const image = Input.fromReadableStream(
												fs.createReadStream(
													join(
														__dirname,
														".",
														"..",
														"..",
														"static",
														`${question.image}.jpg`
													)
												)
											);
											await ctx.reply("Rahmat! Endi keyingi savol...", {
												...Markup.removeKeyboard(),
											});
											await ctx.replyWithPhoto(image, {
												caption:
													user.language == "uz"
														? question.title_uz
														: question.title_ru,

												...Markup.removeKeyboard(),
											});
										}
										return;
									}
									const inline_btns: any = [];
									if (answers[0].count_option == "1") {
										for (const ans of answers) {
											const temp: any = [];
											if (question.input_method == "multiple") {
												temp.push({
													text:
														user.language == "uz"
															? ans.answer_title_uz
															: ans.answer_title_ru,
													callback_data: `multiplesurvey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
												});
											} else {
												temp.push({
													text:
														user.language == "uz"
															? ans.answer_title_uz
															: ans.answer_title_ru,
													callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
												});
											}
											inline_btns.push(temp);
										}
									} else {
										const temp: any = [];
										for (const ans of answers) {
											if (question.input_method == "multiple") {
												temp.push({
													text:
														user.language == "uz"
															? ans.answer_title_uz
															: ans.answer_title_ru,
													callback_data: `multiplesurvey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
												});
											} else {
												temp.push({
													text:
														user.language == "uz"
															? ans.answer_title_uz
															: ans.answer_title_ru,
													callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
												});
											}
											if (temp.length == 2) {
												inline_btns.push([...temp]);
												temp.length = 0;
											}
										}
										if (temp.length == 1) {
											inline_btns.push([...temp]);
											temp.length = 0;
										}
									}
									question.has_user_input
										? inline_btns.push([
												{
													text:
														user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
													callback_data: `other_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
												},
												{
													text:
														user.language == "uz"
															? `ℹ️ Batafsil`
															: `ℹ️ Подробно`,
													callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
												},
											])
										: inline_btns.push([
												{
													text:
														user.language == "uz"
															? `ℹ️ Batafsil`
															: `ℹ️ Подробно`,
													callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
												},
											]);
									if (!question.image) {
										await ctx.reply("Rahmat! Endi keyingi savol...", {
											...Markup.removeKeyboard(),
										});
										await ctx.replyWithHTML(
											user.language == "uz"
												? question.title_uz
												: question.title_ru,
											{
												reply_markup: {
													inline_keyboard: inline_btns,
												},
											}
										);
									} else {
										const { Input } = require("telegraf");
										const image = Input.fromReadableStream(
											fs.createReadStream(
												join(
													__dirname,
													".",
													"..",
													"..",
													"static",
													`${question.image}.jpg`
												)
											)
										);
										await ctx.reply("Rahmat! Endi keyingi savol...", {
											...Markup.removeKeyboard(),
										});
										await ctx.replyWithPhoto(image, {
											caption:
												user.language == "uz"
													? question.title_uz
													: question.title_ru,

											reply_markup: {
												inline_keyboard: inline_btns,
											},
										});
										return;
									}
								}
							}
						}
					}
				}
			}
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
