import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";
import { District } from "./models/district.model";

@Injectable()
export class DistrictService {
	constructor(
		@InjectModel(District) private readonly districtModel: typeof District
	) {}
	create(createDistrictDto: CreateDistrictDto) {
		return this.districtModel.create(createDistrictDto);
	}

	findAll() {
		return this.districtModel.findAll({ include: { all: true } });
	}

	async findOne(id: number) {
		const district = await this.districtModel.findByPk(id, {
			include: { all: true },
		});
		if (!district) {
			throw new NotFoundException(`District not found with id: ${id}`);
		} else {
			return district;
		}
	}

	async update(id: number, updateDistrictDto: UpdateDistrictDto) {
		await this.findOne(id);
		return this.districtModel.update(updateDistrictDto, { where: { id } });
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.districtModel.destroy({ where: { id } });
	}
}
