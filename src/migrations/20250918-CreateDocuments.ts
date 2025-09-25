import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocuments1758144010000 implements MigrationInterface {
  name = 'CreateDocuments1758144010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`documents\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`title\` varchar(160) NOT NULL,
        \`mimeType\` varchar(120) NOT NULL,
        \`size\` bigint NOT NULL,
        \`ownerUserId\` int NULL,
        \`storageProvider\` ENUM('local','s3') NOT NULL DEFAULT 'local',
        \`currentVersion\` int NOT NULL DEFAULT 1,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`IDX_doc_owner\` (\`ownerUserId\`),
        KEY \`IDX_doc_isActive\` (\`isActive\`),
        CONSTRAINT \`FK_doc_owner\` FOREIGN KEY (\`ownerUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`document_versions\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`documentId\` char(36) NOT NULL,
        \`version\` int NOT NULL,
        \`title\` varchar(160) NOT NULL,
        \`mimeType\` varchar(120) NOT NULL,
        \`size\` bigint NOT NULL,
        \`storageKey\` varchar(512) NOT NULL,
        \`checksum\` varchar(64) NULL,
        \`createdByUserId\` int NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_doc_version\` (\`documentId\`, \`version\`),
        KEY \`IDX_doc_version_createdAt\` (\`createdAt\`),
        CONSTRAINT \`FK_document_versions_document\` FOREIGN KEY (\`documentId\`) REFERENCES \`documents\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_document_versions_user\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `document_versions`');
    await queryRunner.query('DROP TABLE IF EXISTS `documents`');
  }
}

