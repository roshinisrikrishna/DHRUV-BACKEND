// Import necessary libraries and models
import { Lifetime } from "awilix";
import { CommentsRepository } from "../repositories/comments";
import { Comments } from "../models/comments";
import { FindConfig, Selector, TransactionBaseService, buildQuery } from "@medusajs/medusa"
import { MedusaError } from "@medusajs/utils"

// Define the CommentsService class
class CommentsService extends TransactionBaseService {
  // Define the lifetime of the service in the dependency injection container
  static LIFE_TIME = Lifetime.SCOPED;

  // Comments repository instance
  protected commentsRepository_: typeof CommentsRepository;

  // Constructor for CommentsService
  constructor(container) {
    super(container) // Call the constructor of the base class
    this.commentsRepository_ = container.commentsRepository; // Initialize comments repository
  }

  // Method to list and count Comments items with pagination and filtering
  async listAndCount(
    selector?: Selector<Comments>, // Filter criteria
    config: FindConfig<Comments> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<[Comments[], number]> { // Returns a tuple of Comments array and count
    const commentsRepo = this.activeManager_.withRepository(this.commentsRepository_)
    const query = buildQuery(selector, config) // Build query based on selector and config
    return commentsRepo.findAndCount(query) // Return the result of the query
  }

  // Method to list comments items
  async list(
    selector?: Selector<Comments>, // Filter criteria
    config: FindConfig<Comments> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<Comments[]> { // Returns an array of comments items
    const [comments] = await this.listAndCount(selector, config) // Reuse listAndCount method
    return comments
  }

  // Method to create a new comments item
  async create(
    data: Pick<Comments, "customer_id" | "product_id" | "email" | "commentText" | "ratings" | "commentTitle" | "image" | "recommendValue" | "customer_name" | "likes" | "dislikes"> // Data for the new Comments item
  ): Promise<Comments> {
    // Execute in an atomic transaction
    return this.atomicPhase_(async (manager) => {
      const commentsRepo = manager.withRepository(this.commentsRepository_)
      const comments = commentsRepo.create() // Create a new comments instance
      // Set the data for the new comments item
      comments.customer_id = data.customer_id
      comments.product_id = data.product_id
      comments.email = data.email
      comments.commentText= data.commentText
      comments.ratings= data.ratings
      comments.commentTitle= data.commentTitle
      comments.image= data.image
      comments.recommendValue= data.recommendValue
      comments.customer_name= data.customer_name
      comments.likes= data.likes
      comments.dislikes= data.dislikes





      const result = await commentsRepo.save(comments) // Save the new comments item
      return result
    })
  }

  // Method to retrieve a specific comments item by ID
  async retrieve(
    id: string, // Comments item ID
    config?: FindConfig<Comments> // Additional configuration for the query
  ): Promise<Comments> {
    const commentsRepo = this.activeManager_.withRepository(this.commentsRepository_)
    const query = buildQuery({ id }, config) // Build the query to find the comments item
    const comments = await commentsRepo.findOne(query) // Retrieve the comments item
    if (!comments) {
      // If the comments item is not found, throw an error
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "comments was not found"
      )
    }
    return comments // Return the found comments item
  }

  // Method to update a comments item
  async update(
    id: string, // comments item ID
    data: Omit<Partial<Comments>, "id"> // Data to update the Comments item
  ): Promise<Comments> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const commentsRepo = manager.withRepository(this.commentsRepository_)
      const comments = await this.retrieve(id) // Retrieve the existing comments item
      Object.assign(comments, data) // Update the comments item with new data
      return await commentsRepo.save(comments) // Save the updated comments item
    })
  }

  // Method to delete a comments item
  async delete(id: string): Promise<void> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const commentsRepo = manager.withRepository(this.commentsRepository_)
      const comments = await this.retrieve(id) // Retrieve the comments item to delete
      await commentsRepo.remove([comments]) // Remove the comments item
    })
  }
}

// Export the CommentsService class
export default CommentsService;
