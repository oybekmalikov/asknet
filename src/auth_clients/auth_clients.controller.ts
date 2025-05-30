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
import { CreateClientDto } from "../clients/dto/create-client.dto";
import { AuthClientsService } from "./auth_clients.service";
import { ClientSignInDto } from "./dto/client-sign-in.dto";

@Controller("auth-clients")
export class AuthClientsController {
	constructor(private readonly authClientService: AuthClientsService) {}
	@Post("sign-up")
	async signUp(@Body() createClientDto: CreateClientDto) {
		return this.authClientService.signUp(createClientDto);
	}
	@Post("sign-in")
	async signIn(
		@Body() clientSignInDto: ClientSignInDto,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authClientService.signIn(clientSignInDto, res);
	}
	@HttpCode(200)
	@Post("sign-out")
	signOut(
		@CookieGetter("refreshToken") refreshToken: string,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authClientService.signOut(refreshToken, res);
	}
	@HttpCode(200)
	@Get("refresh/:id")
	async updateRefreshToken(
		@Res({ passthrough: true }) res: Response,
		@CookieGetter("refreshToken") refresh_token: string,
		@Param("id", ParseIntPipe) id: number
	) {
		return this.authClientService.updateRefreshToken(id, refresh_token, res);
	}
}
