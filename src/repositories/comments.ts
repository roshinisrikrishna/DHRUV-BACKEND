import { Comments } from "../models/comments"
import { 
  dataSource,
} from "@medusajs/medusa/dist/loaders/database"

export const CommentsRepository = dataSource
  .getRepository(Comments)
  .extend({
    customMethod(): void {
      // TODO add custom implementation
      return
    },
  })

export default CommentsRepository