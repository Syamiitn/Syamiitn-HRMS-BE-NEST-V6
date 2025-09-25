import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset/entities/asset.entity';
import { AssetService } from './asset/asset.service';
import { AssetController } from './asset/asset.controller';
import { AssetAssignment } from './asset-assignment/entities/asset-assignment.entity';
import { AssetAssignmentController } from './asset-assignment/asset-assignment.controller';
import { AssetAssignmentService } from './asset-assignment/asset-assignment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetAssignment])],
  controllers: [AssetController, AssetAssignmentController],
  providers: [AssetService, AssetAssignmentService],
  exports: [TypeOrmModule],
})
export class AssetModule {}

