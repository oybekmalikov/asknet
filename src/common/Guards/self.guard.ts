import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";

@Injectable()
export class SelfGuard implements CanActivate {
	constructor(
		private readonly paramId = "id",
		private readonly userId = "id"
	) {}

	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const paramId = req.params[this.paramId];
		if (user.roles.includes("superadmin")) {
			return true;
		}
		if (!paramId || !user) {
			throw new ForbiddenException("user not authentificated");
		}

		if (paramId !== String(user[this.userId])) {
			throw new ForbiddenException("You can access only your own data");
		}

		return true;
	}
}
