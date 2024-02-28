import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCustomerColumns1701683022629 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN "customer_active" text DEFAULT 'false'`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN "totalWishlistItems" integer`);
        await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN "totalCartItems" integer`);
        await queryRunner.query(`CREATE OR REPLACE FUNCTION update_wishlist_count() RETURNS TRIGGER AS $$ BEGIN UPDATE "customer" SET "totalWishlistItems" = (SELECT COUNT(*) FROM "wishlist" WHERE "wishlist"."customer_id" = NEW."customer_id") WHERE "id" = NEW."customer_id"; RETURN NEW; END; $$ LANGUAGE plpgsql;`);
        await queryRunner.query(`CREATE TRIGGER wishlist_changes AFTER INSERT OR UPDATE OR DELETE ON "wishlist" FOR EACH ROW EXECUTE PROCEDURE update_wishlist_count();`);
        await queryRunner.query(`CREATE OR REPLACE FUNCTION update_cart_count() RETURNS TRIGGER AS $$ BEGIN UPDATE "customer" SET "totalCartItems" = (SELECT COUNT(*) FROM "cart" WHERE "cart"."customer_id" = NEW."customer_id") WHERE "id" = NEW."customer_id"; RETURN NEW; END; $$ LANGUAGE plpgsql;`);
        await queryRunner.query(`CREATE TRIGGER cart_changes AFTER INSERT OR UPDATE OR DELETE ON "cart" FOR EACH ROW EXECUTE PROCEDURE update_cart_count();`);
     }
     
     public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS wishlist_changes ON "wishlist"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_wishlist_count CASCADE`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS cart_changes ON "cart"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_cart_count CASCADE`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customer_active"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "totalWishlistItems"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "totalCartItems"`);
     }
     
}
