import { IsEnum, IsNotEmpty } from 'class-validator';

export class Enable2FADto {
  @IsEnum(['email', 'sms', 'all'] as const)
  @IsNotEmpty()
  channel: 'email' | 'sms' | 'all';
}
