import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateSalesQuantityTrigger1702230203392 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE product
        ADD COLUMN sales_quantity integer DEFAULT 0;
      `);
        await queryRunner.query(`
          CREATE OR REPLACE FUNCTION update_sales_quantity()
          RETURNS TRIGGER AS $$
          BEGIN
            UPDATE product
            SET sales_quantity = (
              SELECT SUM(sold_quantity)
              FROM product_variant
              WHERE product_id = NEW.product_id
            )
            WHERE id = NEW.product_id;
            RETURN NEW;
          END;
          $$ language 'plpgsql';
    
          CREATE TRIGGER update_sales_quantity_trigger
          AFTER UPDATE OF sold_quantity ON product_variant
          FOR EACH ROW EXECUTE FUNCTION update_sales_quantity();
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
       
        await queryRunner.query(`
          DROP TRIGGER IF EXISTS update_sales_quantity_trigger ON product_variant;
          DROP FUNCTION IF EXISTS update_sales_quantity;
        `);
        await queryRunner.query(`
        ALTER TABLE product
        DROP COLUMN sales_quantity;
      `);
      }

}
