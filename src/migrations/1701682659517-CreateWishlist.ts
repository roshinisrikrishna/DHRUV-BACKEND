import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateWishlist1701682659517 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wishlist" ("id" character varying NOT NULL, "customer_id" character varying NOT NULL, "variant_id" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_wishlist" PRIMARY KEY ("id"))`);
    }
   
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "wishlist"`);
    }

}
