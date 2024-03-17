// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { CommentsRepository } from "../../../repositories/comments"
import { EntityManager } from "typeorm"
import CommentsService from "../../../services/comments"

// Define the GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the CommentsRepository and EntityManager from Medusa's dependency injection system
  const commentsRepository = req.scope.resolve<typeof CommentsRepository>("commentsRepository");
  const manager = req.scope.resolve<EntityManager>("manager")
  const commentsRepo = manager.withRepository(commentsRepository)
  
  // Extract customer_id and product_id from query parameters
  const product_id = req.query.product_id as string;

  console.log("product_id comments",product_id)

  // Handle different scenarios based on the provided query parameters
  if (req.query.product_id) {
    // Find comments entries for a specific customer and variant
    const existingComments = await commentsRepo.find({
      where: {
        // Cast to string here to ensure type safety
    product_id: String(req.query.product_id),
  }
    });
    console.log("product_id true ",product_id)

    
    if (existingComments) {
      console.log("existing comments ",existingComments)
      // Return the found CoexistingComments entries
      return res.json({ data: existingComments });
    }
  }  else {
    // If no specific query parameters, return all comments entries
    console.log("into else")
    res.json({
      commentssList: await commentsRepo.find(),
    })
  }
}

// Define the POST request handler for creating a new comments entry
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the commentsService
  const commentsService: CommentsService = req.scope.resolve("commentsService")
  console.log("req body POST ", req.body)

  // Basic validation of request body
  if (!req.body.customer_id || !req.body.product_id) {
    return res.status(400).json({ error: "`customer_id` and `product_id` are required." });
  }

  // Create a new comments entry
  const comments = await commentsService.create(req.body)

  // Return the created comments entry
  res.json({
    comments,
  })
}


// Define the DELETE request handler for removing a comments entry
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the commentsService
  const commentsService: CommentsService = req.scope.resolve("commentsService")
  
  // Extract the id from the query parameters
  const id = req.query.id as string;

  console.log("deleted by id ",req.query.id)

  // Delete the comments entry by its ID
  await commentsService.delete(id)

  // Return a 200 status to indicate successful deletion
  res.status(200).end()
}
