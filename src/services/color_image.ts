// Import necessary libraries and models
import { Lifetime } from "awilix";
import { ColorImageRepository } from "../repositories/color_image";
import { ColorImage } from "../models/color_image";
import { FindConfig, Selector, TransactionBaseService, buildQuery } from "@medusajs/medusa"
import { MedusaError } from "@medusajs/utils"

// Define the ColorImageService class
class ColorImageService extends TransactionBaseService {
  // Define the lifetime of the service in the dependency injection container
  static LIFE_TIME = Lifetime.SCOPED;

  // ColorImage repository instance
  protected colorImageRepository_: typeof ColorImageRepository;

  // Constructor for colorImageService
  constructor(container) {
    super(container) // Call the constructor of the base class
    this.colorImageRepository_ = container.colorImageRepository; // Initialize colorImage repository
  }

  // Method to list and count colorImage items with pagination and filtering
  async listAndCount(
    selector?: Selector<ColorImage>, // Filter criteria
    config: FindConfig<ColorImage> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<[ColorImage[], number]> { // Returns a tuple of ColorImage array and count
    const colorImageRepo = this.activeManager_.withRepository(this.colorImageRepository_)
    const query = buildQuery(selector, config) // Build query based on selector and config
    return colorImageRepo.findAndCount(query) // Return the result of the query
  }

  // Method to list colorImage items
  async list(
    selector?: Selector<ColorImage>, // Filter criteria
    config: FindConfig<ColorImage> = { // Default pagination and relation configuration
      skip: 0,
      take: 20,
      relations: [],
    }): Promise<ColorImage[]> { // Returns an array of ColorImage items
    const [colorImages] = await this.listAndCount(selector, config) // Reuse listAndCount method
    return colorImages
  }

  // Method to create a new colorImages item
  async create(
    data: Pick<ColorImage, "option_id" | "thumbnail" | "color" > // Data for the new ColorImage item
  ): Promise<ColorImage> {
    // Execute in an atomic transaction
    return this.atomicPhase_(async (manager) => {
      const colorImageRepo = manager.withRepository(this.colorImageRepository_)
      const colorImage = colorImageRepo.create() // Create a new colorImage instance
      // Set the data for the new colorImage item
      colorImage.option_id = data.option_id
      colorImage.thumbnail = data.thumbnail
      colorImage.color = data.color
     
      const result = await colorImageRepo.save(colorImage) // Save the new colorImage item
      return result
    })
  }

  // Method to retrieve a specific comments item by ID
  async retrieve(
    id: string, // Comments item ID
    config?: FindConfig<ColorImage> // Additional configuration for the query
  ): Promise<ColorImage> {
    const colorImageRepo = this.activeManager_.withRepository(this.colorImageRepository_)
    const query = buildQuery({ id }, config) // Build the query to find the colorImage item
    const colorImage = await colorImageRepo.findOne(query) // Retrieve the colorImage item
    if (!colorImage) {
      // If the colorImage item is not found, throw an error
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "colorImage was not found"
      )
    }
    return colorImage // Return the found colorImage item
  }

  // Method to update a colorImage item
  async update(
    id: string, // colorImage item ID
    data: Omit<Partial<ColorImage>, "id"> // Data to update the ColorImage item
  ): Promise<ColorImage> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const colorImageRepo = manager.withRepository(this.colorImageRepository_)
      const colorImage = await this.retrieve(id) // Retrieve the existing colorImage item
      Object.assign(colorImage, data) // Update the colorImage item with new data
      return await colorImageRepo.save(colorImage) // Save the updated colorImage item
    })
  }

  // Method to delete a colorImage item
  async delete(id: string): Promise<void> {
    // Execute in an atomic transaction
    return await this.atomicPhase_(async (manager) => {
      const colorImageRepo = manager.withRepository(this.colorImageRepository_)
      const colorImage = await this.retrieve(id) // Retrieve the colorImage item to delete
      await colorImageRepo.remove([colorImage]) // Remove the colorImage item
    })
  }
}

// Export the colorImageService class
export default ColorImageService;
