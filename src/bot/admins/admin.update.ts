import { Action, Hears, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "../bot.service";
import { AdminService } from "./admin.service";
@Update()
export class AdminUpdate {
	constructor(
		private readonly botService: BotService,
		private readonly adminService: AdminService
	) {}
	@Hears("So'rovnomalar")
	async onText(ctx: Context) {
		return this.adminService.onSurveys(ctx);
	}
	@Hears("Asosiy Menu")
	async onBackToMain(ctx: Context) {
		return this.botService.adminMenu(ctx, "<b>Admin Menu</b>");
	}
	@Action(/^mainmenu$/)
	async onBackToMainInline(ctx: Context) {
		return this.botService.adminMenu(ctx, "<b>Admin Menu</b>");
	}
	@Action(/^survey_status_(draft|active|complated)$/)
	async onSurveyStatus(ctx: Context) {
		return this.adminService.onSurveyStatus(ctx);
	}
	@Action(/^showfullsurvey_\d+$/)
	async sendSurveyById(ctx: Context) {
		return this.adminService.sendSurveyById(ctx);
	}
	@Action(/^sentsurveytouser_\d+$/)
	async onSendSurveyToUsers(ctx: Context) {
		return this.adminService.onSendSurveyToUsers(ctx);
	}
	@Action(/^setstatussurvey_\d+$/)
	async onSetStatusSurvey(ctx: Context) {
		return this.adminService.onSetStatusSurvey(ctx);
	}
	@Action(/^setsurveystatus_(draft|active|complated)_\d+$/)
	async onSetStatusSurveyTo(ctx: Context) {
		return this.adminService.onSetStatusSurveyTo(ctx);
	}
}
