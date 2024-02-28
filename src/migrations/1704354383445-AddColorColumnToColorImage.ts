import { MigrationInterface, QueryRunner } from "typeorm"

export class AddColorColumnToColorImage1704354383445 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "color_image" ADD COLUMN "color" character varying`);
    }
 
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "color_image" DROP COLUMN "color"`);
    }

}
