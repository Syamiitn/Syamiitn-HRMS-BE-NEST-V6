import { MigrationInterface, QueryRunner } from 'typeorm';

// Class name must end with a JavaScript timestamp (13 digits)
export class AddResetPasswordPurposeToOtpCodes1757486400000 implements MigrationInterface {
  name = 'AddResetPasswordPurposeToOtpCodes1757486400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extend ENUM to include 'reset_password'
    await queryRunner.query(
      "ALTER TABLE `otp_codes` MODIFY `purpose` ENUM('login','enable_2fa','reset_password') NOT NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert ENUM change (will fail if existing rows contain 'reset_password')
    await queryRunner.query(
      "ALTER TABLE `otp_codes` MODIFY `purpose` ENUM('login','enable_2fa') NOT NULL",
    );
  }
}
