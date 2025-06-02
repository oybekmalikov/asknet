import { Action, Hears, Start, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "../bot.service";
import { UserService } from "./users.service";
@Update()
export class UserUpdate {
	constructor(
		private readonly botService: BotService,
		private readonly userService: UserService
	) {}
	@Start()
	async onStart(ctx: Context) {
		return this.userService.start(ctx);
	}
	@Action(/^lang_(uz|ru)_\d+$/)
	async onSelectingLang(ctx: Context) {
		return this.userService.onSelectingLang(ctx);
	}
	@Action(/^usercontinue$/)
	async onEnteringName(ctx: Context) {
		return this.userService.onEnteringName(ctx);
	}
	@Hears("📄 Mening So'rovnomalarim")
	async onMySurveysUz(ctx: Context) {
		return this.userService.onMySurveys(ctx, "uz");
	}
	@Hears("📄 Мои опросы")
	async onMySurveysRu(ctx: Context) {
		return this.userService.onMySurveys(ctx, "ru");
	}
	@Hears("🏠 Bosh menu")
	async toMainMenuUz(ctx: Context) {
		return this.userService.toMainMenu(ctx, "uz");
	}
	@Hears("🏠 Главное меню")
	async toMainMenuRu(ctx: Context) {
		return this.userService.toMainMenu(ctx, "ru");
	}
}
