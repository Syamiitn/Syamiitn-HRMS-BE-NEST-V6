import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1758144012000 implements MigrationInterface {
  name = 'CreatePosts1758144012000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`posts\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`title\` varchar(160) NOT NULL,
        \`content\` text NOT NULL,
        \`type\` ENUM('alert','notification','announcement','update') NOT NULL,
        \`authorUserId\` int NOT NULL,
        \`mediaUrls\` json NULL,
        \`mediaKeys\` json NULL,
        \`departmentIds\` json NULL,
        \`viewsCount\` int NOT NULL DEFAULT 0,
        \`likesCount\` int NOT NULL DEFAULT 0,
        \`commentsCount\` int NOT NULL DEFAULT 0,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`IDX_post_type\` (\`type\`),
        KEY \`IDX_post_author\` (\`authorUserId\`),
        KEY \`IDX_post_createdAt\` (\`createdAt\`),
        CONSTRAINT \`FK_post_author\` FOREIGN KEY (\`authorUserId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`post_comments\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`postId\` char(36) NOT NULL,
        \`userId\` int NOT NULL,
        \`content\` text NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`IDX_post_comment_postId\` (\`postId\`),
        KEY \`IDX_post_comment_userId\` (\`userId\`),
        CONSTRAINT \`FK_post_comment_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_post_comment_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`post_likes\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`postId\` char(36) NOT NULL,
        \`userId\` int NOT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_post_like\` (\`postId\`, \`userId\`),
        KEY \`IDX_post_like_postId\` (\`postId\`),
        KEY \`IDX_post_like_userId\` (\`userId\`),
        CONSTRAINT \`FK_post_like_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_post_like_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`post_views\` (
        \`id\` char(36) NOT NULL PRIMARY KEY,
        \`postId\` char(36) NOT NULL,
        \`userId\` int NOT NULL,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_post_view\` (\`postId\`, \`userId\`),
        KEY \`IDX_post_view_postId\` (\`postId\`),
        KEY \`IDX_post_view_userId\` (\`userId\`),
        CONSTRAINT \`FK_post_view_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_post_view_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `post_views`');
    await queryRunner.query('DROP TABLE IF EXISTS `post_likes`');
    await queryRunner.query('DROP TABLE IF EXISTS `post_comments`');
    await queryRunner.query('DROP TABLE IF EXISTS `posts`');
  }
}

