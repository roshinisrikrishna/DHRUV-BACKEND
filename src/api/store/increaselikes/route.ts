// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { CommentsRepository } from "../../../repositories/comments"
import { EntityManager } from "typeorm"
import CommentsService from "../../../services/comments"

// Define the POST request handler for incrementing the likes column
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // Resolve the CommentsService
    const commentsService: CommentsService = req.scope.resolve("commentsService");
    
    // Extract the ID of the comments entry from the request body
    const id = req.body.id as string;
  
    // Check if the ID is provided in the request body
    if (!id) {
      return res.status(400).json({ error: "`id` is required." });
    }
  
    try {
      // Retrieve the comments entry by its ID
      const comments = await commentsService.retrieve(id);
  
      // Increment the likes column value by 1
      comments.likes += 1;
  
      // Save the updated comments entry with the incremented likes value
      const updatedComments = await commentsService.update(id, {
        likes: comments.likes,
      });
  
      // Return the updated comments entry as a JSON response
      res.json({ comments: updatedComments });
    } catch (error) {
      // Handle any errors that may occur during the process
      console.error("Error incrementing likes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  


