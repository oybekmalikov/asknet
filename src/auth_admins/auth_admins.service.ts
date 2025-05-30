import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { AdminsService } from "../admins/admins.service";
import { Admin } from "../admins/models/admin.models";
import { AdminSignInDto } from "./dto/admin-sigm-in.dto";
@Injectable()
export class AuthAdminsService {
	constructor(
		private readonly adminsService: AdminsService,
		private readonly jwtService: JwtService
	) {}
	async generateTokens(admin: Admin) {
		const payload = {
			id: admin.id,
			isActive: admin.is_active,
			roles: admin.is_creator ? ["admin", "superadmin"] : ["admin"],
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
	async signIn(adminSignInDto: AdminSignInDto, res: Response) {
		const admin = await this.adminsService.findByEmail(adminSignInDto.email);
		if (!admin) {
			throw new BadRequestException("Yaroqsiz email yoki parol");
		}
		if (!admin.is_active) {
			throw new UnauthorizedException("Please, activate your account!");
		}
		const validPassword = await bcrypt.compare(
			adminSignInDto.password,
			admin.password
		);
		if (!validPassword) {
			throw new BadRequestException("Yaroqsiz email yoki parol");
		}
		const { accessToken, refreshToken } = await this.generateTokens(admin);
		res.cookie("refreshToken", refreshToken, {
			maxAge: Number(process.env.COOKIE_TIME),
			httpOnly: true,
		});
		admin.refresh_token = await bcrypt.hash(refreshToken, 7);
		await admin.save();
		return {
			message: "Xush kelibsiz!",
			accessToken,
		};
	}
	async updateRefreshToken(
		adminId: number,
		refresh_token: string,
		res: Response
	) {
		const decodedRefreshToken = await this.jwtService.decode(refresh_token);
		if (adminId !== decodedRefreshToken["id"]) {
			throw new ForbiddenException("Ruxsat yo'q");
		}
		const admin = await this.adminsService.findOne(adminId);
		if (!admin || !admin.refresh_token) {
			throw new NotFoundException("Admin topilmadi");
		}
		const tokenMatch = await bcrypt.compare(refresh_token, admin.refresh_token);
		if (!tokenMatch) {
			throw new ForbiddenException("Forbidden!");
		}
		const { accessToken, refreshToken } = await this.generateTokens(admin);
		const hashshedRefreshToken = await bcrypt.hash(refreshToken, 7);
		await this.adminsService.updateRefreshToken(adminId, hashshedRefreshToken);
		res.cookie("refreshToken", refreshToken, {
			maxAge: Number(process.env.COOKIE_TIME),
			httpOnly: true,
		});
		return {
			message: "Admin Refresh Token updated",
			id: adminId,
			accessToken,
		};
	}
	async signOut(refreshToken: string, res: Response) {
		const adminData = await this.jwtService.verify(refreshToken, {
			secret: process.env.REFRESH_TOKEN_KEY,
		});
		if (!adminData) {
			throw new ForbiddenException("Admin not verified!");
		}
		this.adminsService.updateRefreshToken(adminData.id, null!);
		res.clearCookie("refreshToken");
		return {
			message: "Admin logged out",
		};
	}
}
