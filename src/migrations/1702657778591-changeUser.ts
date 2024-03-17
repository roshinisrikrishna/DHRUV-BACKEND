import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangeUser1702657778591 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          "ALTER TABLE \"user\"" + 
          " ADD COLUMN \"order_access\" boolean," +
          " ADD COLUMN \"products_access\" boolean," +
          " ADD COLUMN \"customers_access\" boolean," +
          " ADD COLUMN \"discounts_access\" boolean," +
          " ADD COLUMN \"giftcards_access\" boolean," +
          " ADD COLUMN \"pricing_access\" boolean," +
          " ADD COLUMN \"analytics_access\" boolean," +
          " ADD COLUMN \"user_access\" boolean," +
          " ADD COLUMN \"settings_access\" boolean"
        )
      }
   
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          "ALTER TABLE \"user\" DROP COLUMN \"order_access\"," +
          " DROP COLUMN \"products_access\"," +
          " DROP COLUMN \"customers_access\"," +
          " DROP COLUMN \"discounts_access\"," +
          " DROP COLUMN \"giftcards_access\"," +
          " DROP COLUMN \"pricing_access\"," +
          " DROP COLUMN \"analytics_access\"," +
          " DROP COLUMN \"user_access\"," +
          " DROP COLUMN \"settings_access\""
        )
      }

}
