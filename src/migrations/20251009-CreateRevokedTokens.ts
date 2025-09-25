import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRevokedTokens1757486402000 implements MigrationInterface {
  name = 'CreateRevokedTokens1757486402000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`revoked_tokens\` (
        \`id\` varchar(36) NOT NULL,
        \`jti\` varchar(255) NOT NULL,
        \`userId\` int NOT NULL,
        \`expiresAt\` datetime NOT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_revoked_jti\` (\`jti\`),
        KEY \`IDX_revoked_expiresAt\` (\`expiresAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `revoked_tokens`');
  }
}

