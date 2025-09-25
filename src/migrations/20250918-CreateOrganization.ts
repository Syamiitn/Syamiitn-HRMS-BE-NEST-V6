import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganization1758144006000 implements MigrationInterface {
  name = 'CreateOrganization1758144006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`organization\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`orgCode\` varchar(40) NOT NULL,
        \`orgName\` varchar(120) NOT NULL,
        \`legalEntityName\` varchar(160) NULL,
        \`domainName\` varchar(100) NULL,
        \`industryType\` varchar(80) NULL,
        \`countryName\` varchar(80) NULL,
        \`stateName\` varchar(80) NULL,
        \`cityName\` varchar(80) NULL,
        \`defaultCurrency\` varchar(10) NULL,
        \`defaultTimezone\` varchar(50) NULL,
        \`defaultLanguage\` varchar(20) NULL,
        \`logoUrl\` text NULL,
        \`contactEmail\` varchar(160) NULL,
        \`contactPhone\` varchar(20) NULL,
        \`groupId\` char(36) NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdByUserId\` int NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_org_orgCode\` (\`orgCode\`),
        KEY \`IDX_org_orgCode\` (\`orgCode\`),
        KEY \`IDX_org_groupId\` (\`groupId\`),
        KEY \`IDX_org_isActive\` (\`isActive\`),
        CONSTRAINT \`FK_org_createdByUser\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_org_group\` FOREIGN KEY (\`groupId\`) REFERENCES \`organization\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `organization`');
  }
}

