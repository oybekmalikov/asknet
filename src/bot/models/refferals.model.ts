import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IReferralCreationDto {
	referrer_id?: string;
	referred_user_id?: string;
	bonus_given: boolean;
	referral_code: string;
}

@Table({ tableName: "referrals", freezeTableName: true })
export class Referral extends Model<Referral, IReferralCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Referral's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Referrer's user ID",
	})
	@Column({ type: DataType.STRING })
	declare reffer_id: string;

	@ApiProperty({
		example: 1,
		description: "Referred user's ID",
	})
	@Column({ type: DataType.STRING })
	declare reffered_user_id: string;

	@ApiProperty({
		example: true,
		description: "Bonus given",
	})
	@Column({ type: DataType.BOOLEAN })
	declare bonus_given: boolean;

	@ApiProperty({
		example: "REF2023",
		description: "Referral code",
	})
	@Column({ type: DataType.STRING(50) })
	declare referral_code: string;
}
