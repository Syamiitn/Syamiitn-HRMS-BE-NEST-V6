import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationSettings1758144007000 implements MigrationInterface {
  name = 'CreateOrganizationSettings1758144007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`organization_settings\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`organizationId\` char(36) NOT NULL,
        \`workingDaysCsv\` varchar(30) NULL DEFAULT 'MON,TUE,WED,THU,FRI',
        \`weekStartDay\` varchar(10) NULL DEFAULT 'MONDAY',
        \`fiscalYearStartDate\` date NULL,
        \`fiscalYearEndDate\` date NULL,
        \`defaultLeavePolicyId\` char(36) NULL,
        \`defaultShiftId\` char(36) NULL,
        \`isTwoFactorRequired\` tinyint NOT NULL DEFAULT 0,
        \`isAuditTrailEnabled\` tinyint NOT NULL DEFAULT 1,
        \`isGdprCompliant\` tinyint NOT NULL DEFAULT 0,
        \`dataRetentionDays\` int NULL,
        \`reportingCycle\` ENUM('monthly','quarterly','yearly') NULL DEFAULT 'monthly',
        \`lastSyncTimestamp\` datetime NULL,
        \`updatedByUserId\` int NULL,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`IDX_settings_orgId\` (\`organizationId\`),
        KEY \`IDX_settings_updatedByUser\` (\`updatedByUserId\`),
        CONSTRAINT \`FK_settings_organization\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organization\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_settings_updatedByUser\` FOREIGN KEY (\`updatedByUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `organization_settings`');
  }
}

