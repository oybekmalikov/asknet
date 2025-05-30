import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly allowedRoles: string[]) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.roles) {
			throw new ForbiddenException("User roles not found.");
		}

		const hasAccess = this.allowedRoles.some((role) =>
			user.roles.includes(role)
		);
		if (!hasAccess) {
			throw new ForbiddenException("You do not have access to this resource.");
		}

		return true;
	}
}
