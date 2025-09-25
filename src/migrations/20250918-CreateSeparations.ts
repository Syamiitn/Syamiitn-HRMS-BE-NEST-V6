import { MigrationInterface, QueryRunner } from 'typeorm';

// Create table matching requested schema (adapted FK targets to existing tables)
export class CreateSeparations1758144003000 implements MigrationInterface {
  name = 'CreateSeparations1758144003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`separation\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,

        \`employeeId\` int NOT NULL,
        \`managerId\` int NULL,

        \`intendedDate\` date NOT NULL,
        \`intendedLastWorkingDate\` date NOT NULL,
        \`approvedLastWorkingDate\` date NULL,

        \`status\` ENUM('draft','submitted','approved','rejected','withdrawn','finalized') NOT NULL DEFAULT 'draft',

        \`reasonId\` char(36) NULL,
        \`reasonNote\` text NULL,

        \`noticePeriodDays\` int NULL,
        \`noticePeriodStartDate\` date NULL,
        \`noticePeriodEndDate\` date NULL,

        \`assetStatus\` ENUM('pending','cleared','hold','not_applicable') NULL DEFAULT 'pending',

        \`changedBy\` int NULL,
        \`changedAt\` datetime NULL,

        \`remarks\` text NULL,
        \`finalizedBy\` int NULL,
        \`finalizedAt\` datetime NULL,

        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`tenantId\` char(36) NULL,

        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        KEY \`IDX_separation_employeeId\` (\`employeeId\`),
        KEY \`IDX_separation_managerId\` (\`managerId\`),
        KEY \`IDX_separation_status\` (\`status\`),
        KEY \`IDX_separation_reasonId\` (\`reasonId\`),
        KEY \`IDX_separation_noticePeriodEndDate\` (\`noticePeriodEndDate\`),

        CONSTRAINT \`FK_separation_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_separation_manager\` FOREIGN KEY (\`managerId\`) REFERENCES \`employees\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_separation_changedBy\` FOREIGN KEY (\`changedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_separation_finalizedBy\` FOREIGN KEY (\`finalizedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `separation`');
  }
}
