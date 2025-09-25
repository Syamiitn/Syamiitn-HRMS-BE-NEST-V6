import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenVersionToUsers1757486401000 implements MigrationInterface {
  name = 'AddTokenVersionToUsers1757486401000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `tokenVersion` int NOT NULL DEFAULT 0'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `tokenVersion`'
    );
  }
}

