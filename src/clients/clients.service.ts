import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcrypt";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Client } from "./models/client.model";
@Injectable()
export class ClientsService {
	constructor(
		@InjectModel(Client) private readonly clientModel: typeof Client
	) {}
	async create(createClientDto: CreateClientDto) {
		const condidate = await this.findByEmail(createClientDto.email);
		if (condidate) {
			throw new ConflictException(`${createClientDto.email} already exists`);
		}
		const hashshedPassword = await bcrypt.hash(createClientDto.password, 7);
		const newClient = this.clientModel.create({
			...createClientDto,
			password: hashshedPassword,
		});
		return newClient;
	}

	findAll() {
		return this.clientModel.findAll({ include: { all: true } });
	}

	findOne(id: number) {
		return this.clientModel.findByPk(id, { include: { all: true } });
	}

	findByEmail(email: string) {
		return this.clientModel.findOne({ where: { email } });
	}

	update(id: number, updateClientDto: UpdateClientDto) {
		return this.clientModel.update(updateClientDto, { where: { id } });
	}

	remove(id: number) {
		return this.clientModel.destroy({ where: { id } });
	}

	async updateRefreshToken(clientId: number, refreshToken: string) {
		const updatedClient = this.clientModel.update(
			{
				refresh_token: refreshToken,
			},
			{ where: { id: clientId } }
		);
		return updatedClient;
	}
}
