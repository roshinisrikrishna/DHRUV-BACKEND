import { Column, Entity } from "typeorm"
import { User as MedusaUser } from "@medusajs/medusa"

@Entity()
export class User extends MedusaUser {
  @Column()
  order_access: boolean

  @Column()
  products_access: boolean

  @Column()
  customers_access: boolean

  @Column()
  discounts_access: boolean

  @Column()
  giftcards_access: boolean

  @Column()
  pricing_access: boolean

  @Column()
  analytics_access: boolean

  @Column()
  user_access: boolean

  @Column()
  settings_access: boolean
}
