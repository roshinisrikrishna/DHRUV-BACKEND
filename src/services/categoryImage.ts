// Import necessary libraries and models
import { Lifetime } from "awilix";
import { CategoryImageRepository } from "../repositories/categoryImage";
import { CategoryImage } from "../models/categoryImage";
import { FindConfig, Selector, TransactionBaseService, buildQuery } from "@medusajs/medusa"
import { MedusaError } from "@medusajs/utils"

// Define the CategoryImageService class
class CategoryImageService extends TransactionBaseService {
  // Define the lifetime of the service in the dependency injection container
  static LIFE_TIME = Lifetime.SCOPED;

  // CategoryImage repository instance
  protected categoryImageRepository_: typeof CategoryImageRepository;

  // Constructor for categoryImageService
  constructor(container) {
    super(container) // Call the constructor of the base class
    this.categoryImageRepository_ = container.categoryImageRepository; // Initialize categoryImage repository
  }

  // Method to list and count categoryImage items with pagination and filtering
  async listAndCount(
    selector?: Selector<CategoryImage>, // Filter criteria
    config: FindConfig<CategoryImage> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<[CategoryImage[], number]> { // Returns a tuple of CategoryImage array and count
    const categoryImageRepo = this.activeManager_.withRepository(this.categoryImageRepository_)
    const query = buildQuery(selector, config) // Build query based on selector and config
    return categoryImageRepo.findAndCount(query) // Return the result of the query
  }

  // Method to list categoryImage items
  async list(
    selector?: Selector<CategoryImage>, // Filter criteria
    config: FindConfig<CategoryImage> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<CategoryImage[]> { // Returns an array of CategoryImage items
    const [categoryImages] = await this.listAndCount(selector, config) // Reuse listAndCount method
    return categoryImages
  }

  // Method to create a new categoryImages item
  async create(
    data: Pick<CategoryImage, "category_id" | "categorythumbnail" | "navimage" > // Data for the new CategoryImage item
  ): Promise<CategoryImage> {
    // Execute in an atomic transaction
    return this.atomicPhase_(async (manager) => {
      const categoryImageRepo = manager.withRepository(this.categoryImageRepository_)
      const categoryImage = categoryImageRepo.create() // Create a new categoryImage instance
      // Set the data for the new categoryImage item
      categoryImage.category_id = data.category_id
      categoryImage.categorythumbnail = data.categorythumbnail
      categoryImage.navimage = data.navimage

      
      const result = await categoryImageRepo.save(categoryImage) // Save the new categoryImage item
      return result
    })
  }

  // Method to retrieve a specific comments item by ID
  async retrieve(
    id: string, // Comments item ID
    config?: FindConfig<CategoryImage> // Additional configuration for the query
  ): Promise<CategoryImage> {
    const categoryImageRepo = this.activeManager_.withRepository(this.categoryImageRepository_)
    const query = buildQuery({ id }, config) // Build the query to find the categoryImage item
    const categoryImage = await categoryImageRepo.findOne(query) // Retrieve the categoryImage item
    if (!categoryImage) {
      // If the categoryImage item is not found, throw an error
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "categoryImage was not found"
      )
    }
    return categoryImage // Return the found categoryImage item
  }

  // Method to update a categoryImage item
  async update(
    id: string, // categoryImage item ID
    data: Omit<Partial<CategoryImage>, "id"> // Data to update the CategoryImage item
  ): Promise<CategoryImage> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const categoryImageRepo = manager.withRepository(this.categoryImageRepository_)
      const categoryImage = await this.retrieve(id) // Retrieve the existing categoryImage item
      Object.assign(categoryImage, data) // Update the categoryImage item with new data
      return await categoryImageRepo.save(categoryImage) // Save the updated categoryImage item
    })
  }

  // Method to delete a categoryImage item
  async delete(id: string): Promise<void> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const categoryImageRepo = manager.withRepository(this.categoryImageRepository_)
      const categoryImage = await this.retrieve(id) // Retrieve the categoryImage item to delete
      await categoryImageRepo.remove([categoryImage]) // Remove the categoryImage item
    })
  }
}

// Export the categoryImageService class
export default CategoryImageService;
