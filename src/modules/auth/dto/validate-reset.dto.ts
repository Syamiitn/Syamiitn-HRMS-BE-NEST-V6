import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateResetDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  code: string;
}

