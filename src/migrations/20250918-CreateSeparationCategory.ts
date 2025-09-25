import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeparationCategory1758144009000 implements MigrationInterface {
  name = 'CreateSeparationCategory1758144009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`separation_category\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`code\` varchar(30) NOT NULL,
        \`label\` varchar(100) NOT NULL,
        \`description\` text NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_separation_category_code\` (\`code\`),
        KEY \`IDX_category_isActive\` (\`isActive\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `separation_category`');
  }
}

