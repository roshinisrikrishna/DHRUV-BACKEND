import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateCategoryImageTable1704296043112 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "category_image" (
                "id" varchar NOT NULL,
                "category_id" varchar NOT NULL UNIQUE,
                "categorythumbnail" varchar NOT NULL,
                "navimage" varchar NOT NULL,
                PRIMARY KEY ("id")
            );
        `);
    }
   
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "category_image";
        `);
    }

}
