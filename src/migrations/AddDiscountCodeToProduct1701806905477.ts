import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDiscountCodeToProduct1701806905477 implements MigrationInterface {
   public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(
         "ALTER TABLE \"product\" ADD COLUMN \"discountCode\" varchar"
       )
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query("ALTER TABLE \"product\" DROP COLUMN \"discountCode\"");
   }
}
