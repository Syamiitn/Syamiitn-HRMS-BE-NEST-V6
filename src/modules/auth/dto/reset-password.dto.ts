import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  password: string;
}

