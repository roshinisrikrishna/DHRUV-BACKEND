import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateCommentsTable1703017418904 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "comments" (
                "id" varchar NOT NULL,
                "customer_id" varchar NOT NULL,
                "product_id" varchar NOT NULL,
                "commentText" text NOT NULL,
                "email" varchar NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "comments";
        `);
    }

}
