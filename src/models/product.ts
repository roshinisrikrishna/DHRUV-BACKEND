import { Column, Entity } from "typeorm"
import { Product as MedusaProduct } from "@medusajs/medusa"

@Entity()
export class Product extends MedusaProduct {
    @Column()
    buy_get_num: number

    @Column()
    buy_get_offer: number

    @Column({ type: "integer", default: 0 })
    sales_quantity: number

    @Column({ type: "integer", default: 0 }) // Column for 'likes'
    ratings: number

    @Column({ type: "integer", default: 0 }) // Column for 'likes'
    comments: number

    @Column({ type: "boolean", default: false })
    multiple_product: boolean

    @Column({ type: "varchar" })
    discountCode: string

    @Column({ type: "varchar" })
    video: string;
}
