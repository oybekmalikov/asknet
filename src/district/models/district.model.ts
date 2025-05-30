import { ApiProperty } from "@nestjs/swagger";
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from "sequelize-typescript";
import { Region } from "../../region/models/region.model";

interface IDistrictCreationDto {
	region_id: number;
	name_uz: string;
	name_ru: string;
}

@Table({ tableName: "district", freezeTableName: true })
export class District extends Model<District, IDistrictCreationDto> {
	@ApiProperty({
		example: 1,
		description: "District's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Region's ID",
	})
	@ForeignKey(() => Region)
	@Column({ type: DataType.INTEGER })
	declare region_id: number;

	@ApiProperty({
		example: "Yunusobad",
		description: "Name in Uzbek",
	})
	@Column({ type: DataType.STRING(100) })
	declare name_uz: string;

	@ApiProperty({
		example: "Юнусабад",
		description: "Name in Russian",
	})
	@Column({ type: DataType.STRING(100) })
	declare name_ru: string;
	@BelongsTo(() => Region)
	region: Region;
}
