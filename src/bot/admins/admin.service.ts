import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { Context, Markup, Telegraf } from "telegraf";
import { BOT_NAME } from "../../app.constants";
import { Survey } from "../../surveys/models/survey.model";
import { UserSurvey } from "../models/user_surveys.model";
import { User } from "../models/users.model";

@Injectable()
export class AdminService {
	constructor(
		@InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
		@InjectModel(User) private readonly userModel: typeof User,
		@InjectModel(UserSurvey)
		private readonly userSurveyModel: typeof UserSurvey,
		@InjectModel(Survey) private readonly surveyModel: typeof Survey
	) {}
	async onSendSurveyToUsers(ctx: Context) {
		const contextAction = ctx.callbackQuery!["data"];
		const surveyId = contextAction.split("_")[1];
		const survey = await this.surveyModel.findOne({ where: { id: surveyId } });
		let userList: any = [];
		if (!(survey?.location == null || survey.radius == 0)) {
			// lokatsiya bo'yicha topib uni radiusda hisoblanadi va bor userlar listga solinadi
		}
		if (!(survey?.district_id == 1000 || survey?.region_id == 1000)) {
			// shu regiondan bo'lgan userlar topiladi
		}
		if (!(survey?.start_age == 0 || survey!.finish_age == 150)) {
			// shu yoshdagi insonlar listga joylanadi
		}
		if (userList.length == 0) {
			userList.length = 0;
			userList = await this.userModel.findAll();
		}
		const textUz = `📄 So'rovnoma № ${survey!.id}
		
📝 So'rovnoma: ${survey?.title_uz}

✏ Ta'rif: ${survey?.description_uz}

💰 So'rovnoma uchun mukofot: ${survey?.reward_per_participant} so'm`;
		const textRu = `📄 Опроса № ${survey!.id}

📝 Опрос: ${survey?.title_ru}

✏ Описание: ${survey?.description_ru}

💰 Награда за опрос: ${survey?.reward_per_participant} сум`;
		for (const user of userList) {
			await this.userSurveyModel.create({
				userId: user.id,
				surveyId: survey!.id,
				status: false,
			});
			if (user.language == "uz") {
				this.bot.telegram.sendMessage(user.userId, textUz, {
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
				this.bot.telegram.sendMessage(user.userId, textRu, {
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
			ctx.replyWithHTML(
				`So'rovnoma № ${survey!.id} foydalanuvchilarga yuborildi.`,
				{ ...Markup.keyboard([["Asosiy Menu"]]).resize() }
			);
		}
		try {
		} catch (error) {
			console.log(`Error on send survey to users: `, error);
		}
	}
	async onSurveys(ctx: Context) {
		try {
			// "draft", "active", "complated"
			await ctx.reply("So'rovnoma statusni tanlang.", {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `draft`,
								callback_data: `survey_status_draft`,
							},
						],
						[
							{
								text: `active`,
								callback_data: `survey_status_active`,
							},
						],
						[
							{
								text: `complated`,
								callback_data: `survey_status_complated`,
							},
						],
					],
				},
			});
		} catch (error) {
			console.log(`Error on Survesy in admin: `, error);
		}
	}
	async onSurveyStatus(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const status = contextAction.split("_")[2];
			ctx.deleteMessage(contextMessage?.message_id);
			const lengthSurvey = await this.surveyModel.findAll();
			const surveys = await this.surveyModel.findAll({
				where: { status },
				limit: 10,
			});
			if (!surveys.length) {
				await ctx.reply(`${status} - statusli so'rovnomalar topilmadi`, {
					...Markup.keyboard([["Asosiy Menu"]]).resize(),
				});
				return;
			}
			const inliline: any = [];
			for (const survey of surveys) {
				const temp: any = [];
				temp.push({
					text: `${survey.id} - ${survey.title_uz}`,
					callback_data: `showfullsurvey_${survey.id}`,
				});
				inliline.push(temp);
			}
			if (surveys.length > 5) {
				inliline.push([
					{
						text: `<`,
						callback_data: `prevsurvey_${surveys[0].id}_${surveys[1].id}`,
					},
					{
						text: `${surveys.length}/${lengthSurvey.length}`,
						callback_data: `none`,
					},
					{
						text: `>`,
						callback_data: `nextsurvey_${surveys[0].id}_${surveys[1].id}`,
					},
				]);
			}
			await ctx.replyWithHTML("So'rovnomalar.", {
				reply_markup: {
					inline_keyboard: inliline,
				},
			});
		} catch (error) {
			console.log(`Error on survey status: `, error);
		}
	}
	async sendSurveyById(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const surveyId = contextAction.split("_")[1];
			const survey = await this.surveyModel.findOne({
				where: { id: surveyId },
				include: { all: true },
			});
			if (!survey) {
				await ctx.reply(`So'rovnoma topilmadi`, {
					...Markup.keyboard([["Asosiy Menu"]]).resize(),
				});
			} else {
				ctx.deleteMessage(contextMessage?.message_id);
				// console.log(survey.dataValues.client.dataValues.company)
				await ctx.replyWithHTML(
					`<b>So'rovnoma № ${survey.id}</b>
Client: ${survey.dataValues.client.dataValues.company}
Title(uz): ${survey.title_uz}
Title(ru): ${survey.title_ru}
Ta'rif(uz):${survey.description_uz}
Ta'rif(ru):${survey.description_ru}
Viloyat: ${survey.region_id == 1000 ? "hamma" : survey.region_id}
Tuman: ${survey.district_id == 1000 ? "hamma" : survey.district_id}
Joylashuv: ${survey.location == null ? "hamma" : survey.location}
Radius: ${survey.radius}
Umumiy mablag': ${survey.total_budget} so'm
Har bir ishtrokchi puli: ${survey.reward_per_participant} so'm
Maximal ishtirokchilar: ${survey.max_participants == null ? "∞" : survey.max_participants} ta
Boshlang'ich yosh: ${survey.start_age == 0 ? "-" : survey.start_age}
Oxirgi yosh: ${survey.finish_age == 150 ? "-" : survey.finish_age}
Holati: ${survey.status}
Anonym: ${survey.is_anonymus}
Turi: ${survey.dataValues.survey_type.dataValues.name}
				`,
					{
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: `Foydalanuvchilarga yuborish`,
										callback_data: `sentsurveytouser_${survey.id}`,
									},
								],
								[
									{
										text: `Holatini o'zgartirish`,
										callback_data: `setstatussurvey_${survey.id}`,
									},
								],
								[
									{
										text: `Asosiy Menu`,
										callback_data: `mainmenu`,
									},
								],
							],
						},
					}
				);
			}
		} catch (error) {
			console.log(error);
		}
	}
	async onSetStatusSurvey(ctx: Context) {
		try {
			// "draft", "active", "complated"
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const surveyId = contextAction.split("_")[1];
			ctx.deleteMessage(contextMessage!.message_id);
			await ctx.replyWithHTML(`Statusni tanlang.`, {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: `active`,
								callback_data: `setsurveystatus_active_${surveyId}`,
							},
							{
								text: `draft`,
								callback_data: `setsurveystatus_draft_${surveyId}`,
							},
						],
						[
							{
								text: `complated`,
								callback_data: `setsurveystatus_complated_${surveyId}`,
							},
						],
						[
							{
								text: `Asosiy Menu`,
								callback_data: `mainmenu`,
							},
						],
					],
				},
			});
		} catch (error) {
			console.log(`Error on setStatusSurvey: `, error);
		}
	}
	async onSetStatusSurveyTo(ctx: Context) {
		try {
			const contextAction = ctx.callbackQuery!["data"];
			const contextMessage = ctx.callbackQuery!["message"];
			const surveyId = contextAction.split("_")[2];
			const status = contextAction.split("_")[1];
			ctx.deleteMessage(contextMessage!.message_id);
			await this.surveyModel.update({ status }, { where: { id: surveyId } });
			ctx.replyWithHTML(`Survey statusi - ${status}ga o'zgartirildi.`, {
				...Markup.keyboard([["Asosiy Menu"]]).resize(),
			});
		} catch (error) {
			console.log(`Error on onSetStatusSurveyTo: `, error);
		}
	}
}
