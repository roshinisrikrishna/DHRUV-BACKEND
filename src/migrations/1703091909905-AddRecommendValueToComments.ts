import { MigrationInterface, QueryRunner } from "typeorm"

export class AddRecommendValueToComments1703091909905 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "recommendValue" boolean NOT NULL DEFAULT false`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "recommendValue"`
        );
    }

}
