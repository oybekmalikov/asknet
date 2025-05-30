import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { ClientsService } from "../clients/clients.service";
import { CreateClientDto } from "../clients/dto/create-client.dto";
import { Client } from "../clients/models/client.model";
import { ClientSignInDto } from "./dto/client-sign-in.dto";
@Injectable()
export class AuthClientsService {
	constructor(
		private readonly clientsService: ClientsService,
		private readonly jwtService: JwtService
	) {}
	async generateTokens(client: Client) {
		const payload = {
			id: client.id,
			isActive: client.is_active,
			roles: ["client"],
		};
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: process.env.ACCESS_TOKEN_KEY,
				expiresIn: process.env.ACCESS_TOKEN_TIME,
			}),
			this.jwtService.signAsync(payload, {
				secret: process.env.REFRESH_TOKEN_KEY,
				expiresIn: process.env.REFRESH_TOKEN_TIME,
			}),
		]);
		return {
			accessToken,
			refreshToken,
		};
	}
	async signUp(createClientDto: CreateClientDto) {
		const condidate = await this.clientsService.findByEmail(
			createClientDto.email
		);
		if (condidate) {
			throw new ConflictException(`${createClientDto.email} allaqachon mavjud`);
		}
		const newClient = await this.clientsService.create(createClientDto);
		return {
			message: "Client created",
			newPatientId: newClient.id,
		};
	}
	async signIn(clientSignInDto: ClientSignInDto, res: Response) {
		const client = await this.clientsService.findByEmail(
			clientSignInDto.email
		);
		if (!client) {
			throw new BadRequestException("Invalid email or password");
		}
		if (!client.is_active) {
			throw new UnauthorizedException("Please, activate your account!");
		}
		const validPassword = await bcrypt.compare(
			clientSignInDto.password,
			client.password
		);
		if (!validPassword) {
			throw new BadRequestException("Invalid email or password");
		}
		const { accessToken, refreshToken } = await this.generateTokens(client);
		res.cookie("refreshToken", refreshToken, {
			maxAge: Number(process.env.COOKIE_TIME),
			httpOnly: true,
		});
		client.refresh_token = await bcrypt.hash(refreshToken, 7);
		await client.save();
		return {
			message: "Welcome!!!",
			accessToken,
		};
	}
	async updateRefreshToken(
		clientId: number,
		refresh_token: string,
		res: Response
	) {
		const decodedRefreshToken = await this.jwtService.decode(refresh_token);
		if (clientId !== decodedRefreshToken["id"]) {
			throw new ForbiddenException("Not Allowed");
		}
		const client = await this.clientsService.findOne(clientId);
		if (!client || !client.refresh_token) {
			throw new NotFoundException("Client not found");
		}
		const tokenMatch = await bcrypt.compare(
			refresh_token,
			client.refresh_token
		);
		if (!tokenMatch) {
			throw new ForbiddenException("Forbidden!");
		}
		const { accessToken, refreshToken } = await this.generateTokens(client);
		const hashshedRefreshToken = await bcrypt.hash(refreshToken, 7);
		await this.clientsService.updateRefreshToken(
			clientId,
			hashshedRefreshToken
		);
		res.cookie("refreshToken", refreshToken, {
			maxAge: Number(process.env.COOKIE_TIME),
			httpOnly: true,
		});
		return {
			message: "Client's refresh token updated",
			id: clientId,
			accessToken,
		};
	}
	async signOut(refreshToken: string, res: Response) {
		const clientData = await this.jwtService.verify(refreshToken, {
			secret: process.env.REFRESH_TOKEN_KEY,
		});
		if (!clientData) {
			throw new ForbiddenException("User not verified!");
		}
		this.clientsService.updateRefreshToken(clientData.id, null!);
		res.clearCookie("refreshToken");
		return {
			message: "User logged out",
		};
	}
}
