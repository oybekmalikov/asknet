import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class CreateSurveyStatisticsDto {
  @ApiProperty({
    example: 1,
    description: "Survey's ID",
  })
  @IsInt({ message: "survey_id must be an integer" })
  survey_id: number;

  @ApiProperty({
    example: 100,
    description: "Total responses",
  })
  @IsInt({ message: "total_responses must be an integer" })
  total_responses: number;

  @ApiProperty({
    example: 80,
    description: "Completed responses",
  })
  @IsInt({ message: "completed_responses must be an integer" })
  completed_responses: number;
}