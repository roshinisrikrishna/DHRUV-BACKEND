import { CategoryImage } from "../models/categoryImage"
import { 
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"

export const CategoryImageRepository = dataSource
  .getRepository(CategoryImage)
  .extend({
    customMethod(): void {
      // TODO add custom implementation
      return
    },
  })

export default CategoryImageRepository