import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationSettingsDto } from './create-organization-settings.dto';

export class UpdateOrganizationSettingsDto extends PartialType(CreateOrganizationSettingsDto) {}

