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

	async findAll() {
		const regions = await this.regionModel.findAll({
			include: { all: true },
			order: [["name_uz", "ASC"]],
		});
		if (!regions.length) {
			return { message: "Regions not found" };
		} else {
			return regions;
		}
	}

	async findOne(id: number) {
		const region = await this.regionModel.findByPk(id, {
			include: { all: true },
		});
		if (!region) {
			throw new NotFoundException(`No region found with id: ${id}`);
		} else {
			return region;
		}
	}

	async update(id: number, updateRegionDto: UpdateRegionDto) {
		const region = await this.regionModel.findByPk(id, {
			include: { all: true },
		});
		if (!region) {
			throw new NotFoundException(`No region found with id: ${id}`);
		} else {
			return this.regionModel.update(updateRegionDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const region = await this.regionModel.findByPk(id, {
			include: { all: true },
		});
		if (!region) {
			throw new NotFoundException(`No region found with id: ${id}`);
		} else {
			await this.regionModel.destroy({ where: { id } });
			return { message: "Region deleted" };
		}
	}
}
