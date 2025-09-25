import { IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;
}

