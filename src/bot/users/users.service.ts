import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as fs from "fs";
import { InjectBot } from "nestjs-telegraf";
import { join } from "path";
import { Op } from "sequelize";
import { Context, Markup, Telegraf } from "telegraf";
import { InlineQueryResultArticle } from "telegraf/typings/core/types/typegram";
import { Admin } from "../../admins/models/admin.models";
import { BOT_NAME } from "../../app.constants";
import { District } from "../../district/models/district.model";
import { QuestionAnswer } from "../../question_answers/models/question_answer.model";
import { QuestionLogic } from "../../question_logics/models/question_logic.model";
import { Question } from "../../questions/models/question.model";
import { Region } from "../../region/models/region.model";
import { Survey } from "../../surveys/models/survey.model";
import {
	aboutBotTextRu,
	aboutBotTextUz,
	moneyLimitToWithdrawUser,
	mySurveyButtonsRu,
	mySurveyButtonsUz,
	rewardUserForRefferalOnRegister,
	usersMainButtonsRu,
	usersMainButtonsUz,
} from "../bot.constants";
import { Referral } from "../models/refferals.model";
import { Response } from "../models/responses.model";
import { UserSurvey } from "../models/user_surveys.model";
import { User } from "../models/users.model";
@Injectable()
export class UserService {
	constructor(
		@InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
		@InjectModel(User) private readonly userModel: typeof User,
		@InjectModel(Admin) private readonly adminModel: typeof Admin,
		@InjectModel(Referral) private readonly referralModel: typeof Referral,
		@InjectModel(UserSurvey)
		private readonly userSurveyModel: typeof UserSurvey,
		@InjectModel(Region) private readonly regionModel: typeof Region,
		@InjectModel(District) private readonly districtModel: typeof District,
		@InjectModel(Response) private readonly responseModel: typeof Response,
		@InjectModel(Survey) private readonly surveyModel: typeof Survey,
		@InjectModel(Question) private readonly questionModel: typeof Question,
		@InjectModel(QuestionAnswer)
		private readonly questionAnswerModel: typeof QuestionAnswer,
		@InjectModel(QuestionLogic)
		private readonly questionLogicModel: typeof QuestionLogic
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
				if ("text" in ctx.message!) {
					const referrerId = ctx.message.text.split(" ")[1];
					if (referrerId) {
						const ref = await this.referralModel.create({
							referral_code: `${referrerId + userId}`,
							bonus_given: false,
						});
						ref.reffer_id = referrerId;
						ref.reffered_user_id = userId;
						await ref.save();
					}
				}
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
	async endOfSurvey(ctx: Context, currUser: User, survey: Survey) {
		await this.userSurveyModel.update(
			{ status: true },
			{ where: { userId: currUser.id, surveyId: survey.id } }
		);
		currUser.balance = currUser.balance + Number(survey.reward_per_participant);
		await currUser.save();
		ctx.replyWithHTML(
			currUser.language == "uz"
				? `🎉 Tabriklaymiz <a href="https://t.me/${currUser?.username}">${currUser?.real_full_name}</a>! Siz so'rovnomani muvaffaqiyatli yakunladingiz!\n\n💰 So'rovnomani yakunlaganingiz uchun hisobingizga ${survey?.reward_per_participant} so'm qo'shildi\n\n📄 Yangi so'rovnomalarni ko'rish uchun «🆕 Yangi So'rovnomalar» ni bosing.`
				: `🎉 Поздравляем <a href="https://t.me/${currUser?.username}">${currUser?.real_full_name}</a>! Вы успешно прошли опрос!\n\n💰 ${survey?.reward_per_participant} сумов были зачислены на ваш счет за прохождение опроса\n\n📄 Чтобы увидеть новые опросы, нажмите «🆕 Новые опросы».`,
			{
				...Markup.keyboard([
					currUser!.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
				]).resize(),
			}
		);
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
					} else if (user.actions == "userchangingname") {
						user.real_full_name = userInput;
						user.actions = "";
						await user.save();
						ctx.replyWithHTML(
							user.language == "uz"
								? "👤 Ism muvaffaqiyatli o'zgartirildi."
								: "👤 Имя успешно изменено.",
							{
								...Markup.keyboard([
									user.language == "uz"
										? ["🏠 Bosh menu"]
										: ["🏠 Главное меню"],
								]).resize(),
							}
						);
					} else if (user.actions == "writingtoadmin") {
						user.actions = "";
						await user.save();
						const res =
							`<b>Foydalanuvchidan savol.</b>\n\n` +
							userInput +
							`\n\n${user.real_full_name}(${user.username ? `${user.username}` : "no_username"}|${user.phone_number}) dan`;
						const admins = await this.adminModel.findAll();
						for (const admin of admins) {
							await this.bot.telegram.sendMessage(Number(admin.userId), res, {
								parse_mode: "HTML",
								reply_markup: {
									inline_keyboard: [
										[
											{
												text: `Javob berish`,
												callback_data: `responsetouser_${admin.userId}_${user.userId}`,
											},
										],
									],
								},
							});
						}
						ctx.replyWithHTML(
							user.language == "uz"
								? "📤 So'rovingiz adminlarga yuborildi, adminlar tez orada so'rovingizni ko'rib chiqib javob yozishadi. 🔜"
								: "📤 Ваш запрос отправлен администраторам, они рассмотрят его и ответят в ближайшее время. 🔜",
							{
								...Markup.keyboard([
									user.language == "uz"
										? ["🏠 Bosh menu"]
										: ["🏠 Главное меню"],
								]).resize(),
							}
						);
					} else if (user.actions.startsWith("survey_")) {
						const [text, surveyId, questionId, logicId, userId] =
							user.actions.split("_");
						const userInput = ctx.message!.text;
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
							await this.endOfSurvey(ctx, user, survey!);
							return;
						} else if (
							logic?.status == "skip_to" ||
							logic?.status == "start_survey"
						) {
							const question = await this.questionModel.findOne({
								where: { id: logic.next_question_id },
							});
							if (!question) {
								await this.endOfSurvey(ctx, user, survey!);
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
									await this.endOfSurvey(ctx, user, survey!);
									return;
								} else {
									if (question.field_type == "text") {
										user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
										await user.save();
										if (!question.image) {
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
														"..",
														"..",
														"..",
														"static",
														`${question.image}.jpg`
													)
												)
											);
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
									if (answers[0].count_option == " 1") {
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
													"..",
													"..",
													"..",
													"static",
													`${question.image}.jpg`
												)
											)
										);
										await ctx.replyWithPhoto(image, {
											caption:
												user.language == "uz"
													? question.title_uz
													: question.title_ru,

											reply_markup: {
												inline_keyboard: inline_btns,
											},
										});
									}
									return;
								}
							}
						}
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
			await this.userModel.update(
				{ actions: "" },
				{ where: { userId: String(ctx.from?.id) } }
			);
			await ctx.replyWithHTML(lang == "uz" ? `📋 Menu` : `📋 Меню`, {
				...Markup.keyboard(
					lang == "uz" ? usersMainButtonsUz : usersMainButtonsRu
				).resize(),
			});
		} catch (error) {
			console.log(`Error on user's toMainMenu: `, error);
		}
	}
	async onSurveyAboutMe(ctx: Context, lang: string) {
		try {
		} catch (error) {
			console.log(`Error on `);
		}
	}
	async onStartSurvey(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const userId = contextAction.split("_")[2];
			const surveyId = contextAction.split("_")[1];
			ctx.deleteMessage(contextMessage?.message_id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				const survey = await this.surveyModel.findOne({
					where: { id: surveyId },
				});
				if (!survey) {
					await ctx.replyWithHTML(
						user.language == "uz"
							? "So'rovnoma mavjud emas."
							: "Анкета недоступна.",
						{
							...Markup.keyboard([
								user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
							]),
						}
					);
					return;
				} else {
					const questions = await this.questionModel.findAll({
						where: { survey_id: surveyId },
						order: [["id", "ASC"]],
					});
					const logic = await this.questionLogicModel.findOne({
						where: { status: "start_survey", question_id: questions[0].id },
					});
					const questionAnswers = await this.questionAnswerModel.findAll({
						where: { question_id: questions[0].id },
					});
					if (
						(!logic || !questions.length) &&
						questions[0].field_type != "text"
					) {
						await ctx.replyWithHTML(
							user.language == "uz"
								? "So'rovnoma mavjud emas."
								: "Анкета недоступна.",
							{
								...Markup.keyboard([
									user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Bosh menu"],
								]).resize(),
							}
						);
						return;
					} else {
						if (questions[0].field_type == "text") {
							user.actions = `survey_${survey.id}_${questions[0].id}_${logic!.id}_${user.id}`;
							await user.save();
							if (!questions[0].image) {
								await ctx.replyWithHTML(
									user.language == "uz"
										? questions[0].title_uz
										: questions[0].title_ru,
									{ ...Markup.removeKeyboard() }
								);
							} else {
								const { Input } = require("telegraf");
								const image = Input.fromReadableStream(
									fs.createReadStream(
										join(
											__dirname,
											"..",
											"..",
											"..",
											"static",
											`${questions[0].image}.jpg`
										)
									)
								);
								await ctx.replyWithPhoto(image, {
									caption:
										user.language == "uz"
											? questions[0].title_uz
											: questions[0].title_ru,
									...Markup.removeKeyboard(),
								});
							}
							return;
						}
						const inline_btns: any = [];
						if (questionAnswers[0].count_option == "1") {
							for (const ans of questionAnswers) {
								const temp: any = [];
								if (questions[0].input_method == "multiple") {
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `multiplesurvey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
									});
								} else {
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `survey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
									});
								}
								inline_btns.push(temp);
							}
						} else {
							const temp: any = [];
							for (const ans of questionAnswers) {
								if (questions[0].input_method == "multiple") {
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `multiplesurvey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
									});
								} else {
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `survey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
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
						questions[0].has_user_input
							? inline_btns.push([
									{
										text: user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
										callback_data: `other_${survey.id}_${questions[0].id}_${logic!.id}_${user.id}`,
									},
									{
										text: user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
										callback_data: `indetail_${survey.id}_${questions[0].id}_${logic!.id}_${user.id}`,
									},
								])
							: inline_btns.push([
									{
										text: user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
										callback_data: `indetail_${survey!.id}_${questions[0].id}_${logic!.id}_${user.id}`,
									},
								]);
						if (!questions[0].image) {
							if (questions[0].input_method == "multiple") {
								await ctx.replyWithHTML(
									user.language == "uz"
										? questions[0].title_uz +
												`\n* Bir nechta javob variantini tanlashingiz mumkin.`
										: questions[0].title_ru +
												`\n* Вы можете выбрать несколько вариантов ответа.`,
									{
										reply_markup: {
											inline_keyboard: inline_btns,
										},
									}
								);
							} else {
								await ctx.replyWithHTML(
									user.language == "uz"
										? questions[0].title_uz
										: questions[0].title_ru,
									{
										reply_markup: {
											inline_keyboard: inline_btns,
										},
									}
								);
							}
						} else {
							const { Input } = require("telegraf");
							const image = Input.fromReadableStream(
								fs.createReadStream(
									join(
										__dirname,
										"..",
										"..",
										"..",
										"static",
										`${questions[0].image}.jpg`
									)
								)
							);
							await ctx.replyWithPhoto(image, {
								caption:
									user.language == "uz"
										? questions[0].title_uz
										: questions[0].title_ru,

								reply_markup: {
									inline_keyboard: inline_btns,
								},
							});
						}
					}
				}
			}
		} catch (error) {
			console.log(`Error on start survey: `, error);
		}
	}
	async onSurvey(ctx: Context) {
		try {
			// survey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			ctx.deleteMessage(contextMessage?.message_id);
			const [text, surveyId, questionId, logicId, answerId, userId] =
				contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				const oldQuestion = await this.questionModel.findOne({
					where: { id: +questionId },
				});
				let userChoise: any;
				if (oldQuestion?.field_type == "region") {
					userChoise = await this.regionModel.findOne({
						where: { id: +answerId },
					});
					await this.responseModel.create({
						participant_id: user.id,
						question_id: +questionId,
						response: (user.language == "uz"
							? userChoise?.name_uz
							: userChoise?.name_ru)!,
						response_time: new Date().toISOString(),
					});
				} else if (oldQuestion?.field_type == "district") {
					userChoise = await this.districtModel.findOne({
						where: { id: +answerId },
					});
					await this.responseModel.create({
						participant_id: user.id,
						question_id: +questionId,
						response: (user.language == "uz"
							? userChoise?.name_uz
							: userChoise?.name_ru)!,
						response_time: new Date().toISOString(),
					});
				} else {
					userChoise = await this.questionAnswerModel.findOne({
						where: { id: +answerId },
					});
					await this.responseModel.create({
						participant_id: user.id,
						question_id: +questionId,
						response: (user.language == "uz"
							? userChoise?.answer_uz
							: userChoise?.answer_ru)!,
						response_time: new Date().toISOString(),
					});
				}
				const logic = await this.questionLogicModel.findOne({
					where: { question_id: +questionId },
				});
				const survey = await this.surveyModel.findOne({
					where: { id: +surveyId },
				});
				if (logic?.status == "end_survey") {
					user.actions = "";
					user.save();
					await this.endOfSurvey(ctx, user, survey!);
					return;
				} else if (
					logic?.status == "skip_to" ||
					logic?.status == "start_survey"
				) {
					const question = await this.questionModel.findOne({
						where: { id: logic.next_question_id },
					});
					if (!question) {
						await this.endOfSurvey(ctx, user, survey!);
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
							await ctx.replyWithHTML(
								user.language == "uz" ? question.title_uz : question.title_ru,
								{
									reply_markup: {
										inline_keyboard: regionbtn,
									},
								}
							);
							return;
						} else if (!answers.length && question.field_type == "district") {
							const districts = await this.districtModel.findAll({
								where: { region_id: +answerId },
							});
							const districtbtn: any = [];
							const temp: any = [];
							for (const ans of districts) {
								temp.push({
									text: user.language == "uz" ? ans.name_uz : ans.name_ru,
									callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
								});
								if (temp.length == 2) {
									districtbtn.push([...temp]);
									temp.length = 0;
								}
							}
							if (temp.length == 1) {
								districtbtn.push([...temp]);
								temp.length = 0;
							}
							await ctx.replyWithHTML(
								user.language == "uz" ? question.title_uz : question.title_ru,
								{
									reply_markup: {
										inline_keyboard: districtbtn,
									},
								}
							);
							return;
						}
						if (!answers.length && question.field_type != "text") {
							await this.endOfSurvey(ctx, user, survey!);
							return;
						} else {
							if (question.field_type == "text") {
								user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
								await user.save();
								if (!question.image) {
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
												"..",
												"..",
												"..",
												"static",
												`${question.image}.jpg`
											)
										)
									);
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
							if (answers[0].count_option == " 1") {
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
											callback_data: `survey_${survey!.id}_${question!.id}_${logic!.id}_${ans.id}_${user.id}`,
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
											text: user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
											callback_data: `other_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
										{
											text:
												user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
											callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
									])
								: inline_btns.push([
										{
											text:
												user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
											callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
									]);
							if (!question.image) {
								await ctx.replyWithHTML(
									user.language == "uz" ? question.title_uz : question.title_ru,
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
											"..",
											"..",
											"..",
											"static",
											`${question.image}.jpg`
										)
									)
								);
								await ctx.replyWithPhoto(image, {
									caption:
										user.language == "uz"
											? question.title_uz
											: question.title_ru,

									reply_markup: {
										inline_keyboard: inline_btns,
									},
								});
							}
							return;
						}
					}
				}
			}
		} catch (error) {
			console.log(`Error during survey: `, error);
		}
	}
	async showUserDatas(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				ctx.replyWithHTML(
					user.language == "uz"
						? `👤 Ism: ${user.real_full_name}\n📞 Telefon raqam: ${user.phone_number}\n🗣 Til: 🇺🇿 O'zbekcha\n💰 Balans: ${user.balance} so'm\n 📈 Holat: ${user.status == false ? "Aktiv emas\n* Sizni holatingiz aktiv bo'lmasa siz ommaviy so'rovnomalarda qatnasha olmaysiz, holatingizni aktiv qilish uchun «📄 Mening So'rovnomalarim» bo'limidagi so'rovnomalarda qatnashishingiz kerak" : "aktiv"}`
						: `👤 Имя: ${user.real_full_name}\n📞 Номер телефона: ${user.phone_number}\n🗣 Язык: 🇷🇺 Русский\n💰 Баланс: ${user.balance} сум\n📈 Статус: ${user.status == false ? "Не активен\n* Если ваш статус не активен, вы не сможете участвовать в публичных опросах. Чтобы активировать свой статус, вы должны участвовать в опросах в разделе «📄 Мои опросы»" : "активен"}`,
					{
						reply_markup: {
							inline_keyboard: [
								[
									user.language == "uz"
										? {
												text: "👤 Ismni o'zgartirish",
												callback_data: `userchange_name_${userId}`,
											}
										: {
												text: "👤 Изменить имя",
												callback_data: `userchange_name_${userId}`,
											},
								],
								[
									user.language == "uz"
										? {
												text: "📞 Telefon raqamini o'zgartirish",
												callback_data: `userchange_phone_${userId}`,
											}
										: {
												text: "📞 Изменить номер телефона",
												callback_data: `userchange_phone_${userId}`,
											},
								],
								[
									user.language == "uz"
										? {
												text: "🗣 Tilni o'zgartirish",
												callback_data: `userchange_lang_${userId}`,
											}
										: {
												text: "🗣 Изменить язык",
												callback_data: `userchange_lang_${userId}`,
											},
								],
							],
						},
					}
				);
			}
		} catch (error) {
			console.log(`Error on show user datas`);
		}
	}
	async changeUserDatas(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			ctx.deleteMessage(contextMessage?.message_id);
			const userId = contextAction.split("_")[2];
			const param = contextAction.split("_")[1];
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				this.throwToStart(ctx);
			} else {
				if (param == "name") {
					user.actions = "userchangingname";
					await user.save();
					ctx.replyWithHTML(
						user.language == "uz"
							? "👤 Yangi ismni kiriting."
							: "👤 Введите новое имя.",
						{
							...Markup.keyboard([
								user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
							]).resize(),
						}
					);
				} else if (param == "phone") {
					user.actions = "userchangingphone";
					await user.save();
					ctx.replyWithHTML(
						user.language == "uz"
							? "☎ Yangi telefon raqamini jo'nating."
							: "☎ Отправьте новый номер телефона.",
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
				} else if (param == "lang") {
					user.actions = "userchanginglang";
					await user.save();
					ctx.replyWithHTML(
						user.language == "uz" ? "🗣 Tilni tanlang." : "🗣 Выберите язык.",
						{
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: `🇺🇿 O'zbekcha`,
											callback_data: `changelang_uz_${userId}`,
										},
										{
											text: `🇷🇺 Русский`,
											callback_data: `changelang_ru_${userId}`,
										},
									],
								],
							},
						}
					);
				}
			}
		} catch (error) {
			console.log(`Error on change user datas`);
		}
	}
	async onChangingLang(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			ctx.deleteMessage(contextMessage?.message_id);
			const userId = contextAction.split("_")[2];
			const newLang = contextAction.split("_")[1];
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				user.language = newLang;
				user.actions = "";
				await user.save();
				await ctx.replyWithHTML(
					user.language == "uz"
						? `🗣 🇺🇿 O'zbek tili tanlandi.`
						: `🗣 🇷🇺 Выбран русский язык.`,
					{
						...Markup.keyboard([
							user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
						]).resize(),
					}
				);
			}
		} catch (error) {
			console.log(`Error on changing lang: `, error);
		}
	}
	async onRefferal(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				await ctx.reply(
					user.language == "uz"
						? `🎯 Do'stlaringizni taklif qiling va mukofotga ega bo‘ling!\n\n💰 Har bir taklif qilgan do'stingiz ro'yxatdan o'tsa, sizga ${rewardUserForRefferalOnRegister} so'm pul mukofoti beriladi.`
						: `🎯 Приглашайте друзей и получайте награды!\n\n💰 За каждого приглашенного вами друга, который зарегистрируется, вы получите денежное вознаграждение в размере ${rewardUserForRefferalOnRegister} сумов.`,
					Markup.inlineKeyboard([
						user.language == "uz"
							? Markup.button.switchToChat("📩 Do'stlarni taklif qilish", ``)
							: Markup.button.switchToChat("📩 Пригласить друзей", ``),
					])
				);
			}
		} catch (error) {
			console.log(`Error on refferal: `, error);
		}
	}
	async onInlineQuery(ctx: Context) {
		try {
			const fromId = ctx.from!.id;
			const botUsername = ctx.me;
			const referralLink = `https://t.me/${botUsername}?start=${fromId}`;
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				if (user.language == "uz") {
					const results: InlineQueryResultArticle[] = [
						{
							type: "article",
							id: "invite_friends",
							title: "Do‘stlarni taklif qilish",
							description:
								"Do‘stlaringizga botni yuboring va bonusga ega bo‘ling!",
							input_message_content: {
								message_text: `👋 Salom! Men so'rovnoma botidan foydalandim, bu botda turli hildagi qiziqarli so'rovnomalar mavjud, siz ham sinab ko‘ring!\n\n🤖 [Botga kirish](${referralLink})`,
								parse_mode: "Markdown",
							},
						},
					];
					await ctx.answerInlineQuery(results);
				} else {
					const results: InlineQueryResultArticle[] = [
						{
							type: "article",
							id: "invite_friends",
							title: "Пригласить друзей",
							description: "Отправьте бота своим друзьям и получите бонус!",
							input_message_content: {
								message_text: `👋 Привет! Я использовал опросный бот, у этого бота есть множество интересных опросов, попробуйте и его!\n\n🤖 [Войти в бот](${referralLink})`,
								parse_mode: "Markdown",
							},
						},
					];
					await ctx.answerInlineQuery(results);
				}
			}
		} catch (error) {
			console.log(`Error on inline query:`, error);
		}
	}
	async aboutBot(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				await ctx.replyWithHTML(
					user.language == "uz" ? aboutBotTextUz : aboutBotTextRu,
					{
						...Markup.keyboard(
							user.language == "uz"
								? [["✏️ Adminga yozish"], ["🏠 Bosh menu"]]
								: [["✏️ Написать администратору"], ["🏠 Главное меню"]]
						).resize(),
					}
				);
			}
		} catch (error) {
			console.log(`Error on about bot: `, error);
		}
	}
	async writeToAdmin(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
			} else {
				user.actions = "writingtoadmin";
				await user.save();
				ctx.replyWithHTML(
					user.language == "uz"
						? `Savolingizni yozing ⬇️`
						: `Напишите свой вопрос ⬇️`,
					{
						...Markup.keyboard([
							user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
						]).resize(),
					}
				);
			}
		} catch (error) {
			console.log(`Error on write to admin: `, error);
		}
	}
	async onOther(ctx: Context) {
		try {
			// callback_data: `other_${survey.id}_${questions[0].id}_${logic!.id}_${user.id}`,
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const [txt, surveyId, questionId, logicId, userId] =
				contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				user.actions = `survey_${surveyId}_${questionId}_${logicId}_${userId}`;
				await user.save();
				const question = await this.questionModel.findOne({
					where: { id: Number(questionId) },
				});
				if (!question) {
					ctx.replyWithHTML(
						user.language == "uz"
							? "❌ So'rovnomada xatolik! 🔄 Iltimos qaytadan urinib ko'ring"
							: "❌ Ошибка опроса! 🔄 Попробуйте еще раз.",
						{
							...Markup.keyboard([
								user.language == "uz" ? ["🏠 Bosh menu"] : ["🏠 Главное меню"],
							]).resize(),
						}
					);
				} else {
					if (!question.image) {
						ctx.editMessageText(
							user.language == "uz"
								? `${question.title_uz}\n\nJavobingizni kiriting ⬇️`
								: `${question.title_ru}\n\nВведите свой ответ ⬇️`
						);
					} else {
						ctx.editMessageCaption(
							user.language == "uz"
								? `${question.title_uz}\n\nJavobingizni kiriting ⬇️`
								: `${question.title_ru}\n\nВведите свой ответ ⬇️`
						);
					}
				}
			}
		} catch (error) {
			console.log(`Error on other: `, error);
		}
	}
	async onMore(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const [txt, surveyId, questionId, logicId, userId] =
				contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				const logic = await this.questionLogicModel.findOne({
					where: { question_id: +questionId },
				});
				const survey = await this.surveyModel.findOne({
					where: { id: +surveyId },
				});
				const question = await this.questionModel.findOne({
					where: { id: logic!.question_id },
				});
				if (!question) {
					await this.endOfSurvey(ctx, user, survey!);
					return;
				} else {
					const answers = await this.questionAnswerModel.findAll({
						where: { question_id: question!.id },
						order: [["id", "ASC"]],
					});
					if (!answers.length && question.field_type != "text") {
						await this.endOfSurvey(ctx, user, survey!);
						return;
					} else {
						if (question.field_type == "text") {
							user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
							await user.save();
							if (!question.image) {
								await ctx.editMessageText(
									user.language == "uz"
										? question.title_uz +
												`\n\nTavsif: ${question.description_uz}`
										: question.title_ru +
												`\n\nОписание: ${question.description_ru}`
								);
							} else {
								await ctx.editMessageCaption(
									user.language == "uz"
										? question.title_uz +
												`\n\nTavsif: ${question.description_uz}`
										: question.title_ru +
												`\n\nОписание: ${question.description_ru}`
								);
							}
							return;
						}
						const inline_btns: any = [];
						if (answers[0].count_option == " 1") {
							for (const ans of answers) {
								const temp: any = [];
								if (question.input_method == "multiple") {
									temp.push({
										text:
											user.language == "uz"
												? question.title_uz +
													`\n\nTavsif: ${question.description_uz}`
												: question.title_ru +
													`\n\nОписание: ${question.description_ru}`,
										callback_data: `multiplesurvey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
									});
								} else {
									temp.push({
										text:
											user.language == "uz"
												? question.title_uz +
													`\n\nTavsif: ${question.description_uz}`
												: question.title_ru +
													`\n\nОписание: ${question.description_ru}`,
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
										callback_data: `survey_${survey!.id}_${question!.id}_${logic!.id}_${ans.id}_${user.id}`,
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
										text: user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
										callback_data: `other_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
									},
								])
							: 0;
						if (!question.image) {
							await ctx.editMessageText(
								user.language == "uz"
									? question.title_uz + `\n\nTavsif: ${question.description_uz}`
									: question.title_ru +
											`\n\nОписание: ${question.description_ru}`,
								{
									reply_markup: {
										inline_keyboard: inline_btns,
									},
								}
							);
						} else {
							await ctx.editMessageCaption(
								user.language == "uz"
									? question.title_uz + `\n\nTavsif: ${question.description_uz}`
									: question.title_ru +
											`\n\nОписание: ${question.description_ru}`,
								{
									reply_markup: {
										inline_keyboard: inline_btns,
									},
								}
							);
						}
						return;
					}
				}
			}
		} catch (error) {
			console.log(`Error on more: `, error);
		}
	}
	async onMultiple(ctx: Context) {
		try {
			// callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
			const contextAction = ctx.callbackQuery!["data"];
			const [txt, surveyId, questionId, logicId, answerId, userId] =
				contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				const userChoise = await this.questionAnswerModel.findOne({
					where: { id: +answerId },
				});
				await this.responseModel.create({
					participant_id: user.id,
					question_id: +questionId,
					response: (user.language == "uz"
						? userChoise?.answer_uz
						: userChoise?.answer_ru)!,
					response_time: new Date().toISOString(),
				});
				const logic = await this.questionLogicModel.findOne({
					where: { question_id: +questionId },
				});
				const survey = await this.surveyModel.findOne({
					where: { id: +surveyId },
				});
				const question = await this.questionModel.findOne({
					where: { id: +questionId },
				});
				if (!question) {
					return;
				} else {
					const answers = await this.questionAnswerModel.findAll({
						where: { question_id: question!.id },
						order: [["id", "ASC"]],
					});

					if (!answers.length && question.field_type != "text") {
						return;
					} else {
						const inline_btns: any = [];
						if (answers[0].count_option == " 1") {
							for (const ans of answers) {
								const temp: any = [];
								if (ans.id == +answerId) {
									if (question.input_method == "multiple") {
										temp.push({
											text:
												user.language == "uz"
													? ans.answer_title_uz + " ✅"
													: ans.answer_title_ru + " ✅",
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
								} else {
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
								}
								inline_btns.push(temp);
							}
						} else {
							const temp: any = [];
							for (const ans of answers) {
								if (ans.id == +answerId) {
									if (question.input_method == "multiple") {
										temp.push({
											text:
												user.language == "uz"
													? ans.answer_title_uz + " ✅"
													: ans.answer_title_ru + " ✅",
											callback_data: `multiplesurvey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
										});
									} else {
										temp.push({
											text:
												user.language == "uz"
													? ans.answer_title_uz
													: ans.answer_title_ru,
											callback_data: `survey_${survey!.id}_${question!.id}_${logic!.id}_${ans.id}_${user.id}`,
										});
									}
								} else {
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
											callback_data: `survey_${survey!.id}_${question!.id}_${logic!.id}_${ans.id}_${user.id}`,
										});
									}
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
										text: user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
										callback_data: `other_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
									},
									{
										text: user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
										callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
									},
								])
							: inline_btns.push([
									{
										text: user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
										callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
									},
								]);
						inline_btns.push([
							{
								text: user.language == "uz" ? `Keyingi ➡️` : `Далее ➡️`,
								callback_data: `confirm_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
							},
						]);
						if (!question.image) {
							await ctx.editMessageText(
								user.language == "uz" ? question.title_uz : question.title_ru,
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
										"..",
										"..",
										"..",
										"static",
										`${question.image}.jpg`
									)
								)
							);
							await ctx.editMessageCaption(
								user.language == "uz" ? question.title_uz : question.title_ru,
								{
									reply_markup: {
										inline_keyboard: inline_btns,
									},
								}
							);
						}
						return;
					}
				}
			}
		} catch (error) {
			console.log(`Error on multiple: `, error);
		}
	}
	async onConfirmMultiple(ctx: Context) {
		try {
			//callback_data: `confirm_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			ctx.deleteMessage(contextMessage?.message_id);
			const [text, surveyId, questionId, logicId, userId] =
				contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				const logic = await this.questionLogicModel.findOne({
					where: { question_id: +questionId },
				});
				const survey = await this.surveyModel.findOne({
					where: { id: +surveyId },
				});
				if (logic?.status == "end_survey") {
					user.actions = "";
					user.save();
					await this.endOfSurvey(ctx, user, survey!);
					return;
				} else if (
					logic?.status == "skip_to" ||
					logic?.status == "start_survey"
				) {
					const question = await this.questionModel.findOne({
						where: { id: logic.next_question_id },
					});
					if (!question) {
						await this.endOfSurvey(ctx, user, survey!);
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
							await ctx.replyWithHTML(
								user.language == "uz" ? question.title_uz : question.title_ru,
								{
									reply_markup: {
										inline_keyboard: regionbtn,
									},
								}
							);
							return;
						}
						if (!answers.length && question.field_type != "text") {
							await this.endOfSurvey(ctx, user, survey!);
							return;
						} else {
							if (question.field_type == "text") {
								user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
								await user.save();
								if (!question.image) {
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
												"..",
												"..",
												"..",
												"static",
												`${question.image}.jpg`
											)
										)
									);
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
							if (answers[0].count_option == " 1") {
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
											callback_data: `survey_${survey!.id}_${question!.id}_${logic!.id}_${ans.id}_${user.id}`,
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
											text: user.language == "uz" ? `📝 Boshqa` : `📝 Другой`,
											callback_data: `other_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
										{
											text:
												user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
											callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
									])
								: inline_btns.push([
										{
											text:
												user.language == "uz" ? `ℹ️ Batafsil` : `ℹ️ Подробно`,
											callback_data: `indetail_${survey!.id}_${question.id}_${logic!.id}_${user.id}`,
										},
									]);
							if (!question.image) {
								await ctx.replyWithHTML(
									user.language == "uz" ? question.title_uz : question.title_ru,
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
											"..",
											"..",
											"..",
											"static",
											`${question.image}.jpg`
										)
									)
								);
								await ctx.replyWithPhoto(image, {
									caption:
										user.language == "uz"
											? question.title_uz
											: question.title_ru,

									reply_markup: {
										inline_keyboard: inline_btns,
									},
								});
							}
							return;
						}
					}
				}
			}
		} catch (error) {
			console.log(`Error on confirm multiple: `, error);
		}
	}
	async onMyAllSurveys(ctx: Context, id: number) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				this.throwToStart(ctx);
				return;
			} else {
				const survey = await this.surveyModel.findByPk(id);
				const textUz = `📄 So'rovnoma № ${survey!.id}
📝 Sorovnoma' tavsifi: ${survey?.title_uz}

✏ Ta'rif: ${survey?.description_uz}

💰 So'rovnoma uchun mukofot: ${survey?.reward_per_participant} so'm`;
				const textRu = `📄 Опроса № ${survey!.id}

📝 Опрос: ${survey?.title_ru}

✏ Описание: ${survey?.description_ru}

💰 Награда за опрос: ${survey?.reward_per_participant} сум`;
				await this.userSurveyModel.create({
					userId: user.id,
					surveyId: survey!.id,
					status: false,
				});
				if (user.language == "uz") {
					await ctx.replyWithHTML(textUz, {
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `Boshlash`,
										callback_data: `startsurvey_${survey!.id}_${user.userId}`,
									},
								],
							],
						},
					});
				} else {
					await ctx.replyWithHTML(textRu, {
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `Начинать`,
										callback_data: `startsurvey_${survey!.id}_${user.userId}`,
									},
								],
							],
						},
					});
				}
			}
		} catch (error) {
			console.log(`Error on about me: `, error);
		}
	}
	async onNewSurveys(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				await this.throwToStart(ctx);
				return;
			} else {
				if (user.status) {
					const userSurveys = await this.userSurveyModel.findAll({
						where: { userId: user.id },
					});
					if (!userSurveys.length) {
						await ctx.replyWithHTML(
							user.language == "uz"
								? `❎ Hozircha so'rovnomalar yo'q, so'rovnomalar kelishi bilan sizga xabar beramiz.`
								: `❎ Пока опросов нет, мы сообщим вам, как только они появятся.`,
							{
								...Markup.keyboard([
									user!.language == "uz"
										? ["🏠 Bosh menu"]
										: ["🏠 Главное меню"],
								]).resize(),
							}
						);
					} else {
						const surveys = await this.surveyModel.findAll({
							where: { status: "active" },
							limit: 10,
							order: [["id", "ASC"]],
						});
						const lengthSurvey = await this.surveyModel.findAll();
						let dd = 0;
						const inliline: any = [];
						for (const survey of surveys) {
							const temp: any = [];
							temp.push({
								text: `${survey.id} - ${survey.title_uz}`,
								callback_data: `showfullsurveyuser_${survey.id}`,
							});
							inliline.push(temp);
							dd += 1;
						}
						inliline.push([
							{
								text: `<`,
								callback_data: `npsurveyuser_prev_${surveys[0].id}_${surveys[dd - 1].id}_${user.id}`,
							},
							{
								text: `${surveys[surveys.length - 1].id}/${lengthSurvey.length}`,
								callback_data: `none`,
							},
							{
								text: `>`,
								callback_data: `npsurveyuser_next_${surveys[0].id}_${surveys[dd - 1].id}_${user.id}`,
							},
						]);

						ctx.replyWithHTML(
							user.language == "uz"
								? "So'rovnomani tanlang."
								: "Выберите опрос.",
							{
								reply_markup: {
									inline_keyboard: inliline,
								},
							}
						);
					}
				} else {
					const surveys = await UserSurvey.findAll({
						where: {
							userId: user.id,
							surveyId: [1, 2, 3, 4, 5],
						},
					});

					const isCompleted = [1, 2, 3, 4, 5].every((id) =>
						surveys.find((s) => s.surveyId === id && s.status === true)
					);

					if (isCompleted) {
						await User.update({ status: true }, { where: { id: user.id } });
						await this.onNewSurveys(ctx);
						return;
					} else {
						await ctx.replyWithHTML(
							user.language == "uz"
								? `❗️ Siz profil so'rovnomalaridan to'liq o'tmagansiz, «📄 Mening So'rovnomalarim» bo'limidagi so'rovnomalarni bajaring.`
								: `❗️ Вы не прошли профильные опросы, пройдите опросы в разделе «📄 Мои опросы».`
						);
					}
				}
			}
		} catch (error) {
			console.log(`Error on new surveys: `, error);
		}
	}
	async npSurveyUser(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const [text, direction, from, to, userId] = contextAction.split("_");
			const user = await this.userModel.findOne({ where: { id: +userId } });
			let surveys: Survey[];
			const lengthSurvey = await this.surveyModel.findAll();
			if (direction == "prev") {
				if (Number(to) - 10 < 0) {
					return;
				}
				surveys = await this.surveyModel.findAll({
					where: { id: { [Op.lt]: Number(from) }, status: "active" },
					limit: 10,
					order: [["id", "ASC"]],
				});
			} else {
				if (lengthSurvey.length - Number(to) <= 0) {
					return;
				}
				surveys = await this.surveyModel.findAll({
					where: { id: { [Op.gt]: Number(to) }, status: "active" },
					limit: 10,
					order: [["id", "ASC"]],
				});
			}
			let dd = 0;
			const inliline: any = [];
			for (const survey of surveys) {
				const temp: any = [];
				temp.push({
					text: `${survey.id} - ${survey.title_uz}`,
					callback_data: `showfullsurveyuser_${survey.id}`,
				});
				inliline.push(temp);
				dd += 1;
			}
			inliline.push([
				{
					text: `<`,
					callback_data: `npsurveyuser_prev_${surveys[0].id}_${surveys[dd - 1].id}_${user!.id}`,
				},
				{
					text: `${surveys[surveys.length - 1].id}/${lengthSurvey.length}`,
					callback_data: `none`,
				},
				{
					text: `>`,
					callback_data: `npsurveyuser_next_${surveys[0].id}_${surveys[dd - 1].id}_${user!.id}`,
				},
			]);

			ctx.editMessageText(
				user!.language == "uz" ? "So'rovnomani tanlang." : "Выберите опрос.",
				{
					reply_markup: {
						inline_keyboard: inliline,
					},
				}
			);
		} catch (error) {
			console.log(`Error on np survey user: `, error);
		}
	}
	async showFullSurveyUser(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			ctx.deleteMessage(contextMessage?.message_id);
			const [text, surveyId] = contextAction.split("_");
			await this.onMyAllSurveys(ctx, Number(surveyId));
		} catch (error) {
			console.log(`Error on show full surveys user: `, error);
		}
	}
	async onBalance(ctx: Context) {
		try {
			const userId = String(ctx.from?.id);
			const user = await this.userModel.findOne({ where: { userId } });
			if (!user) {
				this.throwToStart(ctx);
				return;
			} else {
				await ctx.replyWithHTML(
					user.language == "uz"
						? `💰 Sizning hisobingizda ${user.balance} so'm bor.\n💳 Hisobingizdagi pulni yechib olish uchun sizning hisobingizda kamida ${moneyLimitToWithdrawUser} so'm bo'lishi kerak.`
						: `💰 На вашем счету ${user.balance} сумов.\n💳 Чтобы вывести деньги со счета, на вашем счете должно быть не менее ${moneyLimitToWithdrawUser} сумов.`,
					{
						...Markup.keyboard(
							user.language == "uz"
								? [["✏️ Adminga yozish"], ["🏠 Bosh menu"]]
								: [["✏️ Написать администратору"], ["🏠 Главное меню"]]
						).resize(),
					}
				);
			}
		} catch (error) {
			console.log(`Error on balance: `, error);
		}
	}
}
