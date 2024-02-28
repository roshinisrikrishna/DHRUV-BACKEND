import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCommentTitleAndImage1703085844903 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "commentTitle" character varying NOT NULL DEFAULT ''`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "image" character varying NOT NULL DEFAULT ''`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "commentTitle"`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "image"`
        );
    }
}
