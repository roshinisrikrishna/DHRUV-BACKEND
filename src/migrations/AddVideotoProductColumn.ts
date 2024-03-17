import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoColumnToProduct1690876698954 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
   

        // New query to add the 'video' column
        await queryRunner.query(
            "ALTER TABLE \"product\" ADD COLUMN \"video\" varchar"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert existing queries
      

        // Revert new query to remove the 'video' column
        await queryRunner.query("ALTER TABLE \"product\" DROP COLUMN \"video\"");
    }
}
