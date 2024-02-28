// Import necessary decorators from the TypeORM package
import { Column, Entity } from "typeorm"
// Import the Customer model from MedusaJS
import { Customer as MedusaCustomer } from "@medusajs/medusa"

// Define the Customer class which extends the MedusaCustomer class from MedusaJS
@Entity() // Marks the class as a TypeORM entity, indicating that it's a table in the database
export class Customer extends MedusaCustomer {
  @Column() // Marks 'customer_active' as a database column
  customer_active: string // A custom field added to the Customer model to indicate if the customer is active

  @Column({ type: "int", nullable: true }) // Marks 'totalWishlistItems' as a database column, specifies its type and allows it to be nullable
  totalWishlistItems: number; // A custom field to store the total number of items in the customer's wishlist

  @Column({ type: "int", nullable: true }) // Marks 'totalCartItems' as a database column, specifies its type and allows it to be nullable
  totalCartItems: number; // A custom field to store the total number of items in the customer's cart
}
