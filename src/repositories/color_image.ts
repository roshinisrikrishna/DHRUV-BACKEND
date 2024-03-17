import { ColorImage } from "../models/color_image"
import { 
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"

export const ColorImageRepository = dataSource
  .getRepository(ColorImage)
  .extend({
    customMethod(): void {
      // TODO add custom implementation
      return
    },
  })

export default ColorImageRepository