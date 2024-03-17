import { BeforeInsert, Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Unique } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
@Unique(["option_id"]) // This will enforce uniqueness on the 'category_id' column
export class ColorImage extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: "varchar" })
  option_id: string;

  @Column({ type: "varchar" })
  thumbnail: string;

  @Column({ type: "character varying" }) // New column
  color: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "color_image");
  }
}
