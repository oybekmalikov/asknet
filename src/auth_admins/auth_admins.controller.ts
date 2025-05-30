import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Res,
} from "@nestjs/common";
import { Response } from "express";
import { CookieGetter } from "../common/decorators/cookie-getter.decorator";
import { AuthAdminsService } from "./auth_admins.service";
import { AdminSignInDto } from "./dto/admin-sigm-in.dto";

@Controller("auth-admins")
export class AuthAdminsController {
	constructor(private readonly authAdminsService: AuthAdminsService) {}
	@Post("sign-in")
	async signIn(
		@Body() adminSignInDto: AdminSignInDto,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authAdminsService.signIn(adminSignInDto, res);
	}
	@HttpCode(200)
	@Post("sign-out")
	signOut(
		@CookieGetter("refreshToken") refreshToken: string,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authAdminsService.signOut(refreshToken, res);
	}
	@HttpCode(200)
	@Get("refresh/:id")
	async updateRefreshToken(
		@Res({ passthrough: true }) res: Response,
		@CookieGetter("refreshToken") refresh_token: string,
		@Param("id", ParseIntPipe) id: number
	) {
		return this.authAdminsService.updateRefreshToken(id, refresh_token, res);
	}
}
