import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultipleProductColumn1704299399908 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product" ADD COLUMN "multiple_product" boolean DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product" DROP COLUMN "multiple_product";
    `);
  }
}
