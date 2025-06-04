import { UseFilters, UseGuards } from "@nestjs/common";
import { Command, On, Start, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { TelegrafExceptionFilter } from "../common/filters/telegraf-exception.filters";
import { AdminGuard } from "../common/guards/admin.guard";
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
	constructor(private readonly botService: BotService) {}
	@UseFilters(TelegrafExceptionFilter)
	@UseGuards(AdminGuard)
	@Command("admin")
	async onAdminCommand(ctx: Context) {
		await this.botService.adminMenu(ctx, "<b>Admin Menu</b>");
	}
	@On("contact")
	async onContact(ctx: Context) {
		return this.botService.onContact(ctx);
	}
	@On("location")
	async onLocation(ctx: Context) {
		return this.botService.onLocation(ctx);
	}
	@On("text")
	async onText(ctx: Context) {
		return this.botService.onText(ctx);
	}
	
}
