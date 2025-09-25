import { PartialType } from '@nestjs/mapped-types';
import { CreateFinalSettlementDto } from './create-final-settlement.dto';

export class UpdateFinalSettlementDto extends PartialType(CreateFinalSettlementDto) {}

