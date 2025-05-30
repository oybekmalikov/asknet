import { ConflictException, Injectable } from "@nestjs/common";
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

	findAll() {
		return this.adminModel.findAll({ include: { all: true } });
	}

	findOne(id: number) {
		return this.adminModel.findByPk(id, { include: { all: true } });
	}
	findByEmail(email: string) {
		return this.adminModel.findOne({ where: { email } });
	}

	update(id: number, updateAdminDto: UpdateAdminDto) {
		return this.adminModel.update(updateAdminDto, { where: { id } });
	}

	remove(id: number) {
		return this.adminModel.destroy({ where: { id } });
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
