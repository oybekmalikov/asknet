import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { Region } from "./models/region.model";

@Injectable()
export class RegionService {
	constructor(
		@InjectModel(Region) private readonly regionModel: typeof Region
	) {}
	create(createRegionDto: CreateRegionDto) {
		return this.regionModel.create(createRegionDto);
	}

	findAll() {
		return this.regionModel.findAll({ include: { all: true } });
	}

	async findOne(id: number) {
		const region = await this.regionModel.findByPk(id, {
			include: { all: true },
		});
		if (!region) {
			throw new NotFoundException(`Region not found with id: ${id}`);
		} else {
			return region;
		}
	}

	async update(id: number, updateRegionDto: UpdateRegionDto) {
		await this.findOne(id);
		return this.regionModel.update(updateRegionDto, { where: { id } });
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.regionModel.destroy({ where: { id } });
	}
}
