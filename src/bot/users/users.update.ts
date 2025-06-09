import { Action, Hears, On, Start, Update } from "nestjs-telegraf";
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
	@On("inline_query")
	async InlineQuery(ctx: Context) {
		return this.userService.onInlineQuery(ctx);
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
	@Hears("🎁 Refferal")
	async onRefferalUz(ctx: Context) {
		return this.userService.onRefferal(ctx);
	}
	@Hears("🎁 Реферал")
	async onRefferalRu(ctx: Context) {
		return this.userService.onRefferal(ctx);
	}
	@Hears("🏠 Bosh menu")
	async toMainMenuUz(ctx: Context) {
		return this.userService.toMainMenu(ctx, "uz");
	}
	@Hears("🏠 Главное меню")
	async toMainMenuRu(ctx: Context) {
		return this.userService.toMainMenu(ctx, "ru");
	}
	@Action(/^startsurvey_\d+_\d+/)
	async onStartSurvey(ctx: Context) {
		return this.userService.onStartSurvey(ctx);
	}
	@Action(/^survey_\d+_\d+_\d+_\d+_\d+/)
	async onSurvey(ctx: Context) {
		return this.userService.onSurvey(ctx);
	}
	@Hears("👤 Profil")
	async showUserDatasUz(ctx: Context) {
		return this.userService.showUserDatas(ctx);
	}
	@Hears("👤 Профиль")
	async showUserDatasRu(ctx: Context) {
		return this.userService.showUserDatas(ctx);
	}
	@Action(/^userchange_(name|phone|lang)_\d+$/)
	async changeUserDatas(ctx: Context) {
		return this.userService.changeUserDatas(ctx);
	}
	@Action(/^changelang_(uz|ru)_\d+$/)
	async onChangingLang(ctx: Context) {
		return this.userService.onChangingLang(ctx);
	}
	@Hears("ℹ️ Bot haqida")
	async aboutBotUz(ctx: Context) {
		return this.userService.aboutBot(ctx);
	}
	@Hears("ℹ️ О боте")
	async aboutBotRu(ctx: Context) {
		return this.userService.aboutBot(ctx);
	}
	@Hears("✏️ Adminga yozish")
	async writeToAdminUz(ctx: Context) {
		return this.userService.writeToAdmin(ctx);
	}
	@Hears("✏️ Написать администратору")
	async writeToAdminRu(ctx: Context) {
		return this.userService.writeToAdmin(ctx);
	}
	@Action(/^other_\d+_\d+_\d+_\d+/)
	async onOther(ctx: Context) {
		return this.userService.onOther(ctx);
	}
	@Action(/^indetail_\d+_\d+_\d+_\d+/)
	async onMore(ctx: Context) {
		return this.userService.onMore(ctx);
	}
	@Action(/^multiplesurvey_\d+_\d+_\d+_\d+_\d+/)
	async onMultiple(ctx: Context) {
		return this.userService.onMultiple(ctx);
	}
	@Action(/^confirm_\d+_\d+_\d+_\d+$/)
	async onConfirmMultiple(ctx: Context) {
		return this.userService.onConfirmMultiple(ctx);
	}
	@Hears("👤 Men haqimda")
	async aboutMeUz(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 1);
	}
	@Hears("👤 Обо мне")
	async aboutMeRu(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 1);
	}
	@Hears("👨‍👩‍👧‍👦 Oilam")
	async myFamiliyUz(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 2);
	}
	@Hears("👨‍👩‍👧‍👦 Моя семья")
	async myFamiliyRu(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 2);
	}
	@Hears("🎓 Ta'lim")
	async myEducationUz(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 3);
	}
	@Hears("🎓 Образование")
	async myEducationRu(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 3);
	}
	@Hears("💼 Kasbim")
	async myJobUz(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 4);
	}
	@Hears("💼 Моя профессия")
	async myJobRu(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 4);
	}
	@Hears("💰 Daromad/Harajatlarim")
	async myIncomesUz(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 5);
	}
	@Hears("💰 Мои доходы/расходы")
	async myIncomesRu(ctx: Context) {
		return this.userService.onMyAllSurveys(ctx, 5);
	}
	@Hears("🆕 Yangi So'rovnomalar")
	async onNewSurveysUz(ctx: Context) {
		return this.userService.onNewSurveys(ctx);
	}
	@Hears("🆕 Новые опросы")
	async onNewSurveysRu(ctx: Context) {
		return this.userService.onNewSurveys(ctx);
	}
	@Action(/^npsurveyuser_(prev|next)_\d+_\d+_\d+$/)
	async npSurveyUserUz(ctx: Context) {
		return this.userService.npSurveyUser(ctx);
	}
	@Action(/^showfullsurveyuser_\d+$/)
	async showFullSurveyUser(ctx: Context) {
		return this.userService.showFullSurveyUser(ctx);
	}
	@Hears("💰 Balans")
	async onBalanceUz(ctx: Context) {
		return this.userService.onBalance(ctx);
	}
	@Hears("💰 Баланс")
	async onBalanceRu(ctx: Context) {
		return this.userService.onBalance(ctx);
	}
}
