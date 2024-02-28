// Import decorators and types from TypeORM and utility functions from Medusa
import { BeforeInsert, Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

// Define the Wishlist entity
@Entity() // Marks the class as a TypeORM entity, indicating that it corresponds to a table in your database
export class Wishlist extends BaseEntity {
  @PrimaryColumn() // Marks 'id' as the primary column in the table
  id: string; // Field for the entity's ID

  @Column({ type: "varchar" }) // Marks 'customer_id' as a column with varchar type in the table
  customer_id: string; // Field for storing the customer's ID

  @Column({ type: "varchar" }) // Marks 'variant_id' as a column with varchar type in the table
  variant_id: string; // Field for storing the ID of the product variant

  @Column({ type: "varchar" }) // Marks 'email' as a column with varchar type in the table
  email: string; // Field for storing the customer's email

  @BeforeInsert() // TypeORM decorator that specifies a method to run before inserting a new record
  private beforeInsert(): void {
    // If the ID is not already set, generate a new ID for this entity using a Medusa utility function
    this.id = generateEntityId(this.id, "wishlist");
  }
}
