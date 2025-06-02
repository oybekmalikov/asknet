import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TelegrafException, TelegrafExecutionContext } from "nestjs-telegraf";
import { Context } from "telegraf";
import { Admin } from "../../admins/models/admin.models";

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(
		@InjectModel(Admin)
		private readonly adminModel: typeof Admin
	) {}
	async canActivate(context: ExecutionContext) {
		const ctx = TelegrafExecutionContext.create(context);
		const { from } = ctx.getContext<Context>();
		const admins = await this.adminModel.findAll();
		for (const admin of admins) {
			if (admin.userId == String(from!.id)) {
				return true;
			}
		}
		throw new TelegrafException(
			"You are not an administrator, you do not have permission 🙅‍♂️"
		);
	}
}
