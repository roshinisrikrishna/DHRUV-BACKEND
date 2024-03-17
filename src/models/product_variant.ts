import { Column, Entity } from "typeorm"
import { ProductVariant as MedusaProductVariant } from "@medusajs/medusa"

@Entity()
export class ProductVariant extends MedusaProductVariant {
 @Column({ type: "integer", default: 0 })
 sold_quantity: number
}
