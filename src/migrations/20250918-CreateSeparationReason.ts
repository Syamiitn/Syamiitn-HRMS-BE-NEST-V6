import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeparationReason1758144005000 implements MigrationInterface {
  name = 'CreateSeparationReason1758144005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`separation_reason\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`name\` varchar(160) NOT NULL,
        \`description\` text NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`tenantId\` char(36) NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_separation_reason_name\` (\`name\`),
        KEY \`IDX_separation_reason_isActive\` (\`isActive\`),
        KEY \`IDX_separation_reason_tenantId\` (\`tenantId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add FK from separation.reasonId -> separation_reason.id
    await queryRunner.query(`
      ALTER TABLE \`separation\`
      ADD CONSTRAINT \`FK_separation_reason\`
      FOREIGN KEY (\`reasonId\`) REFERENCES \`separation_reason\` (\`id\`) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `separation` DROP FOREIGN KEY `FK_separation_reason`');
    await queryRunner.query('DROP TABLE IF EXISTS `separation_reason`');
  }
}

