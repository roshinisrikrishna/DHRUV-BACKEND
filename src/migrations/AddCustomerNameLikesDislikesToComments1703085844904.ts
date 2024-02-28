import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerNameLikesDislikesToComments1703085844904 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "customer_name" character varying NOT NULL DEFAULT ''`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "likes" integer NOT NULL DEFAULT 0`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" ADD "dislikes" integer NOT NULL DEFAULT 0`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "customer_name"`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "likes"`
        );
        await queryRunner.query(
            `ALTER TABLE "comments" DROP COLUMN "dislikes"`
        );
    }
}
