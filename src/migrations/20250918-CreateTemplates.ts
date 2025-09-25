import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTemplates1758144011000 implements MigrationInterface {
  name = 'CreateTemplates1758144011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`templates\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`name\` varchar(160) NOT NULL,
        \`code\` varchar(60) NOT NULL,
        \`category\` ENUM('Email','SMS','OTP','Document','Other') NOT NULL,
        \`format\` ENUM('text','html','markdown') NOT NULL DEFAULT 'text',
        \`content\` text NOT NULL,
        \`tags\` json NULL,
        \`requiredPlaceholders\` json NULL,
        \`ownerUserId\` int NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_template_code\` (\`code\`),
        KEY \`IDX_template_category\` (\`category\`),
        KEY \`IDX_template_owner\` (\`ownerUserId\`),
        KEY \`IDX_template_isActive\` (\`isActive\`),
        CONSTRAINT \`FK_template_owner\` FOREIGN KEY (\`ownerUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `templates`');
  }
}

