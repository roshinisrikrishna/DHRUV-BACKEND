import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBuyGetColumns1701806905477 implements MigrationInterface {
   public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(
         "ALTER TABLE \"product\" ADD COLUMN \"buy_get_num\" integer"
       )
       await queryRunner.query(
         "ALTER TABLE \"product\" ADD COLUMN \"buy_get_offer\" integer"
       )
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query("ALTER TABLE \"product\" DROP COLUMN \"buy_get_num\"");
       await queryRunner.query("ALTER TABLE \"product\" DROP COLUMN \"buy_get_offer\"");
   }
}
