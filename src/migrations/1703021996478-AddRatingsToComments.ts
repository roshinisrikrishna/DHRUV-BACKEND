import { MigrationInterface, QueryRunner } from "typeorm"

export class AddRatingsToComments1703021996478 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD COLUMN "ratings" integer DEFAULT 0`);
     }
     

     public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "ratings"`);
     }
     

}
