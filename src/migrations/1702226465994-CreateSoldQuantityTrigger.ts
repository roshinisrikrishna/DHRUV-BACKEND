import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSoldQuantityTrigger1702226465994 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the sold_quantity column
        await queryRunner.query(`
            ALTER TABLE product_variant
            ADD COLUMN IF NOT EXISTS sold_quantity integer DEFAULT 0;
        `);

        // Create the trigger and function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION create_sold_quantity()
            RETURNS TRIGGER AS $$
            BEGIN
              UPDATE product_variant
              SET sold_quantity = (
                SELECT SUM(quantity)
                FROM line_item
                WHERE variant_id = NEW.variant_id
              )
              WHERE id = NEW.variant_id;
              RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER create_sold_quantity_trigger
            AFTER UPDATE OF quantity ON line_item
            FOR EACH ROW EXECUTE FUNCTION create_sold_quantity();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the trigger and function
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS create_sold_quantity_trigger ON line_item;
            DROP FUNCTION IF EXISTS create_sold_quantity;
        `);

        // Remove the sold_quantity column
        await queryRunner.query(`
            ALTER TABLE product_variant
            DROP COLUMN IF EXISTS sold_quantity;
        `);
    }


}
