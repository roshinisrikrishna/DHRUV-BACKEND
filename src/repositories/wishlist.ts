import { Wishlist } from "../models/wishlist"
import { 
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"

export const WishlistRepository = dataSource
  .getRepository(Wishlist)
  .extend({
    customMethod(): void {
      // TODO add custom implementation
      return
    },
  })

export default WishlistRepository