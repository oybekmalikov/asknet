import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../../app.constants";
import { District } from "../../district/models/district.model";
import { QuestionAnswer } from "../../question_answers/models/question_answer.model";
import { QuestionLogic } from "../../question_logics/models/question_logic.model";
import { Question } from "../../questions/models/question.model";
import { Region } from "../../region/models/region.model";
import { Survey } from "../../surveys/models/survey.model";
import {
	mySurveyButtonsRu,
	mySurveyButtonsUz,
	usersMainButtonsRu,
	usersMainButtonsUz,
} from "../bot.constants";
import { Response } from "../models/responses.model";
import { UserSurvey } from "../models/user_surveys.model";
import { User } from "../models/users.model";

@Injectable()
export class UserService {
	constructor(
		@InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
		@InjectModel(User) private readonly userModel: typeof User,
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
								if (!answers.length && question.field_type != "text") {
									await this.endOfSurvey(ctx, user, survey!);
									return;
								} else {
									if (question.field_type == "text") {
										user.actions = `survey_${survey!.id}_${question.id}_${logic!.id}_${user.id}`;
										await user.save();
										await ctx.replyWithHTML(
											user.language == "uz"
												? question.title_uz
												: question.title_ru,
											{ ...Markup.removeKeyboard() }
										);
										return;
									}
									const inline_btns: any = [];
									if (answers[0].count_option == " 1") {
										for (const ans of answers) {
											const temp: any = [];
											temp.push({
												text:
													user.language == "uz"
														? ans.answer_title_uz
														: ans.answer_title_ru,
												callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
											});
											inline_btns.push(temp);
										}
									} else {
										const temp: any = [];
										for (const ans of answers) {
											temp.push({
												text:
													user.language == "uz"
														? ans.answer_title_uz
														: ans.answer_title_ru,
												callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
											});
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
							await ctx.replyWithHTML(
								user.language == "uz"
									? questions[0].title_uz
									: questions[0].title_ru,
								{ ...Markup.removeKeyboard() }
							);
							return;
						}
						const inline_btns: any = [];
						if (questionAnswers[0].count_option == " 1") {
							for (const ans of questionAnswers) {
								const temp: any = [];
								temp.push({
									text:
										user.language == "uz"
											? ans.answer_title_uz
											: ans.answer_title_ru,
									callback_data: `survey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
								});
								inline_btns.push(temp);
							}
						} else {
							const temp: any = [];
							for (const ans of questionAnswers) {
								temp.push({
									text:
										user.language == "uz"
											? ans.answer_title_uz
											: ans.answer_title_ru,
									callback_data: `survey_${survey.id}_${questions[0].id}_${logic!.id}_${ans.id}_${user.id}`,
								});
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
								await ctx.replyWithHTML(
									user.language == "uz" ? question.title_uz : question.title_ru,
									{ ...Markup.removeKeyboard() }
								);
								return;
							}
							const inline_btns: any = [];
							if (answers[0].count_option == " 1") {
								for (const ans of answers) {
									const temp: any = [];
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
									});
									inline_btns.push(temp);
								}
							} else {
								const temp: any = [];
								for (const ans of answers) {
									temp.push({
										text:
											user.language == "uz"
												? ans.answer_title_uz
												: ans.answer_title_ru,
										callback_data: `survey_${survey!.id}_${question.id}_${logic!.id}_${ans.id}_${user.id}`,
									});
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
							await ctx.replyWithHTML(
								user.language == "uz" ? question.title_uz : question.title_ru,
								{
									reply_markup: {
										inline_keyboard: inline_btns,
									},
								}
							);
							return;
						}
					}
				}
			}
		} catch (error) {
			console.log(`Error during survey: `, error);
		}
	}
}
