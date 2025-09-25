import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeparationTasks1758144004000 implements MigrationInterface {
  name = 'CreateSeparationTasks1758144004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`separation_task\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`separationId\` char(36) NOT NULL,
        \`title\` varchar(160) NOT NULL,
        \`description\` text NULL,
        \`priority\` ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
        \`status\` ENUM('pending','in_progress','blocked','completed','canceled') NOT NULL DEFAULT 'pending',
        \`assignedTo\` int NULL,
        \`dueDate\` date NULL,
        \`completedAt\` datetime NULL,
        \`completedBy\` int NULL,
        \`remarks\` text NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`IDX_separation_task_separationId\` (\`separationId\`),
        KEY \`IDX_separation_task_status\` (\`status\`),
        KEY \`IDX_separation_task_assignedTo\` (\`assignedTo\`),
        KEY \`IDX_separation_task_dueDate\` (\`dueDate\`),
        CONSTRAINT \`FK_separation_task_separation\` FOREIGN KEY (\`separationId\`) REFERENCES \`separation\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_separation_task_assignedTo\` FOREIGN KEY (\`assignedTo\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_separation_task_completedBy\` FOREIGN KEY (\`completedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `separation_task`');
  }
}

