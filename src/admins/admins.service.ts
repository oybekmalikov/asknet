import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcrypt";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { Admin } from "./models/admin.models";
@Injectable()
export class AdminsService {
	constructor(@InjectModel(Admin) private readonly adminModel: typeof Admin) {}
	async create(createAdminDto: CreateAdminDto) {
		const condidate = await this.findByEmail(createAdminDto.email);
		if (condidate) {
			throw new ConflictException(`${createAdminDto.email} already exists`);
		}
		const hashshedPassword = await bcrypt.hash(createAdminDto.password, 7);
		const newAdmin = this.adminModel.create({
			...createAdminDto,
			password: hashshedPassword,
		});
		return newAdmin;
	}

	async findAll() {
		const admins = await this.adminModel.findAll({ include: { all: true } });
		if (!admins.length) {
			return { message: "Admins not found" };
		} else {
			return admins;
		}
	}

	async findOne(id: number) {
		const admin = await this.adminModel.findByPk(id, {
			include: { all: true },
		});
		if (!admin) {
			throw new NotFoundException(`No admin found with id: ${id}`);
		} else {
			return admin;
		}
	}
	findByEmail(email: string) {
		return this.adminModel.findOne({ where: { email } });
	}

	async update(id: number, updateAdminDto: UpdateAdminDto) {
		const admin = await this.adminModel.findByPk(id, {
			include: { all: true },
		});
		if (!admin) {
			throw new NotFoundException(`No admin found with id: ${id}`);
		} else {
			if ("password" in updateAdminDto) {
				const hashshedPassword = await bcrypt.hash(updateAdminDto.password!, 7);
				return this.adminModel.update(
					{ ...updateAdminDto, password: hashshedPassword },
					{
						where: { id },
						returning: true,
					}
				)
			} else {
				return this.adminModel.update(updateAdminDto, {
					where: { id },
					returning: true,
				});
			}
		}
	}

	async remove(id: number) {
		const admin = await this.adminModel.findByPk(id, {
			include: { all: true },
		});
		if (!admin) {
			throw new NotFoundException(`No admin found with id: ${id}`);
		} else {
			await this.adminModel.destroy({ where: { id } });
			return {message:"Admin deleted"}
		}
	}
	async updateRefreshToken(adminId: number, refreshToken: string) {
		const updatedAdmin = this.adminModel.update(
			{
				refresh_token: refreshToken,
			},
			{ where: { id: adminId } }
		);
		return updatedAdmin;
	}
}
