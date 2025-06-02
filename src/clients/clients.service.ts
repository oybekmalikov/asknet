import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
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

	async findAll() {
		const clinets = await this.clientModel.findAll({ include: { all: true } });
		if (!clinets.length) {
			return { message: "Clients not found" };
		} else {
			return clinets;
		}
	}

	async findOne(id: number) {
		const clinet = await this.clientModel.findByPk(id, {
			include: { all: true },
		});
		if (!clinet) {
			throw new NotFoundException(`No clinet found with id: ${id}`);
		} else {
			return clinet;
		}
	}

	findByEmail(email: string) {
		return this.clientModel.findOne({ where: { email } });
	}

	async update(id: number, updateClientDto: UpdateClientDto) {
		const client = await this.clientModel.findByPk(id, {
			include: { all: true },
		});
		if (!client) {
			throw new NotFoundException(`No client found with id: ${id}`);
		} else {
			if ("password" in updateClientDto) {
				const hashshedPassword = await bcrypt.hash(
					updateClientDto.password!,
					7
				);
				return this.clientModel.update(
					{ ...updateClientDto, password: hashshedPassword },
					{
						where: { id },
						returning: true,
					}
				);
			} else {
				return this.clientModel.update(updateClientDto, {
					where: { id },
					returning: true,
				});
			}
		}
	}

	async remove(id: number) {
		const client = await this.clientModel.findByPk(id, {
			include: { all: true },
		});
		if (!client) {
			throw new NotFoundException(`No admin found with id: ${id}`);
		} else {
			await this.clientModel.destroy({ where: { id } });
			return { message: "Client deleted" };
		}
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
	async activation(link: string) {
		if (!link) {
			throw new BadRequestException({
				message: "Activation link not found",
			});
		}
		const updatedClient = await this.clientModel.update(
			{ is_active: true },
			{ where: { activation_link: link, is_active: false }, returning: true }
		);
		if (!updatedClient[1][0]) {
			throw new BadRequestException({
				message: "Client already activated",
			});
		}
		return {
			message: "Client successfully activated!",
			is_active: updatedClient[1][0].is_active,
		};
	}
}
