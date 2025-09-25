import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePolicy1758144008000 implements MigrationInterface {
  name = 'CreatePolicy1758144008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`policy\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`policyCode\` varchar(40) NOT NULL,
        \`title\` varchar(160) NOT NULL,
        \`description\` text NULL,
        \`category\` ENUM('Leave','Conduct','Security','IT','Compliance','Other') NOT NULL,
        \`documentUrl\` text NULL,
        \`version\` varchar(20) NULL DEFAULT 'v1.0',
        \`effectiveFrom\` date NULL,
        \`effectiveTo\` date NULL,
        \`isMandatory\` tinyint NOT NULL DEFAULT 1,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`visibleToRoles\` json NULL,
        \`createdByUserId\` int NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_policy_code\` (\`policyCode\`),
        KEY \`IDX_policy_category\` (\`category\`),
        KEY \`IDX_policy_isMandatory\` (\`isMandatory\`),
        KEY \`IDX_policy_isActive\` (\`isActive\`),
        CONSTRAINT \`FK_policy_createdBy\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `policy`');
  }
}

