import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDate, IsInt } from 'class-validator';

export class CreateDepartmentDto {
    @IsInt()
    @IsOptional()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;
}
