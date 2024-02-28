// Import necessary libraries and models
import { Lifetime } from "awilix";
import { WishlistRepository } from "../repositories/wishlist";
import { Wishlist } from "../models/wishlist";
import { FindConfig, Selector, TransactionBaseService, buildQuery } from "@medusajs/medusa"
import { MedusaError } from "@medusajs/utils"

// Define the WishlistService class
class WishlistService extends TransactionBaseService {
  // Define the lifetime of the service in the dependency injection container
  static LIFE_TIME = Lifetime.SCOPED;

  // Wishlist repository instance
  protected wishlistRepository_: typeof WishlistRepository;

  // Constructor for WishlistService
  constructor(container) {
    super(container) // Call the constructor of the base class
    this.wishlistRepository_ = container.wishlistRepository; // Initialize wishlist repository
  }

  // Method to list and count wishlist items with pagination and filtering
  async listAndCount(
    selector?: Selector<Wishlist>, // Filter criteria
    config: FindConfig<Wishlist> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<[Wishlist[], number]> { // Returns a tuple of wishlist array and count
    const wishlistRepo = this.activeManager_.withRepository(this.wishlistRepository_)
    const query = buildQuery(selector, config) // Build query based on selector and config
    return wishlistRepo.findAndCount(query) // Return the result of the query
  }

  // Method to list wishlist items
  async list(
    selector?: Selector<Wishlist>, // Filter criteria
    config: FindConfig<Wishlist> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<Wishlist[]> { // Returns an array of wishlist items
    const [wishlist] = await this.listAndCount(selector, config) // Reuse listAndCount method
    return wishlist
  }

  // Method to create a new wishlist item
  async create(
    data: Pick<Wishlist, "customer_id" | "variant_id" | "email"> // Data for the new wishlist item
  ): Promise<Wishlist> {
    // Execute in an atomic transaction
    return this.atomicPhase_(async (manager) => {
      const wishlistRepo = manager.withRepository(this.wishlistRepository_)
      const wishlist = wishlistRepo.create() // Create a new wishlist instance
      // Set the data for the new wishlist item
      wishlist.customer_id = data.customer_id
      wishlist.variant_id = data.variant_id
      wishlist.email = data.email
      const result = await wishlistRepo.save(wishlist) // Save the new wishlist item
      return result
    })
  }

  // Method to retrieve a specific wishlist item by ID
  async retrieve(
    id: string, // Wishlist item ID
    config?: FindConfig<Wishlist> // Additional configuration for the query
  ): Promise<Wishlist> {
    const wishlistRepo = this.activeManager_.withRepository(this.wishlistRepository_)
    const query = buildQuery({ id }, config) // Build the query to find the wishlist item
    const wishlist = await wishlistRepo.findOne(query) // Retrieve the wishlist item
    if (!wishlist) {
      // If the wishlist item is not found, throw an error
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Wishlist was not found"
      )
    }
    return wishlist // Return the found wishlist item
  }

  // Method to update a wishlist item
  async update(
    id: string, // Wishlist item ID
    data: Omit<Partial<Wishlist>, "id"> // Data to update the wishlist item
  ): Promise<Wishlist> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const wishlistRepo = manager.withRepository(this.wishlistRepository_)
      const wishlist = await this.retrieve(id) // Retrieve the existing wishlist item
      Object.assign(wishlist, data) // Update the wishlist item with new data
      return await wishlistRepo.save(wishlist) // Save the updated wishlist item
    })
  }

  // Method to delete a wishlist item
  async delete(id: string): Promise<void> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const wishlistRepo = manager.withRepository(this.wishlistRepository_)
      const wishlist = await this.retrieve(id) // Retrieve the wishlist item to delete
      await wishlistRepo.remove([wishlist]) // Remove the wishlist item
    })
  }
}

// Export the WishlistService class
export default WishlistService;
