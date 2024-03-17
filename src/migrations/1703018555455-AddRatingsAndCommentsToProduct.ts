import { MigrationInterface, QueryRunner } from "typeorm"

export class AddRatingsAndCommentsToProduct1703018555455 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adding the 'ratings' column
        await queryRunner.query(`
            ALTER TABLE "product" 
            ADD "ratings" integer NOT NULL DEFAULT 0
        `);

        // Adding the 'comments' column
        await queryRunner.query(`
            ALTER TABLE "product" 
            ADD "comments" integer NOT NULL DEFAULT 0
        `);

        // Update the 'comments' column with the count of related comments
        await queryRunner.query(`
            UPDATE "product" 
            SET "comments" = (
                SELECT COUNT(*) 
                FROM "comments" 
                WHERE "comments"."product_id" = "product"."id"
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the 'ratings' column
        await queryRunner.query(`
            ALTER TABLE "product" 
            DROP COLUMN "ratings"
        `);

        // Revert the 'comments' column
        await queryRunner.query(`
            ALTER TABLE "product" 
            DROP COLUMN "comments"
        `);
    }

}
