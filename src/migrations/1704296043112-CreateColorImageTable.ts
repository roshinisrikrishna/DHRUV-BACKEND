import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateColorImageTable1704296043112 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "color_image" (
                "id" varchar NOT NULL,
                "option_id" varchar NOT NULL UNIQUE,
                "thumbnail" varchar NOT NULL,
                PRIMARY KEY ("id")
            );
        `);

    }
   
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "color_image";
        `);
    }

}
