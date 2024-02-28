// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { CategoryImageRepository } from "../../../repositories/categoryImage"
import { EntityManager } from "typeorm"
import CategoryImageService from "src/services/categoryImage"

// Define the GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the CategoryImageRepository and EntityManager from Medusa's dependency injection system
  const categoryImageRepository = req.scope.resolve<typeof CategoryImageRepository>("categoryImageRepository");
  const manager = req.scope.resolve<EntityManager>("manager")
  const categoryImageRepo = manager.withRepository(categoryImageRepository)
  
  // Extract customer_id and category_id from query parameters
  const category_id = req.query.category_id as string;

  console.log("category_id categoryImage",category_id)

  // Handle different scenarios based on the provided query parameters
  if (req.query.category_id) {
    // Find categoryImage entries for a specific customer and variant
    const existingCategoryImage = await categoryImageRepo.find({
      where: {
        // Cast to string here to ensure type safety
    category_id: String(req.query.category_id),
  }
    });
    console.log("category_id true ",category_id)

    
    if (existingCategoryImage) {
      console.log("existing categoryImage ",existingCategoryImage)
      // Return the found CoexistingCategoryImage entries
      return res.json({ data: existingCategoryImage });
    }
  }  else {
    // If no specific query parameters, return all categoryImage entries
    console.log("into else")
    res.json({
      categoryImageList: await categoryImageRepo.find(),
    })
  }
}

// Define the POST request handler for creating a new comments entry
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const categoryImageService: CategoryImageService = req.scope.resolve("categoryImageService");
  const manager = req.scope.resolve<EntityManager>("manager");
  const categoryImageRepo = manager.withRepository(CategoryImageRepository);

  console.log("req body POST", req.body);

  // Basic validation of request body
  if (!req.body.category_id || req.body.category_id === "") {
    return res.status(400).json({ error: "`category_id`, `categorythumbnail`, and `navimage` are required." });
  }

  const { category_id, categorythumbnail, navimage } = req.body;

  // Check if an entry with the same category_id already exists
  const existingCategoryImage = await categoryImageRepo.findOne({ where: { category_id } });

  if (existingCategoryImage) {
    // If exists, update the existing entry
    existingCategoryImage.categorythumbnail = categorythumbnail;
    existingCategoryImage.navimage = navimage;
    await categoryImageRepo.save(existingCategoryImage);
    return res.json({ message: "CategoryImage updated successfully", categoryImage: existingCategoryImage });
  } else {
    // If not, create a new entry
    const newCategoryImage = await categoryImageService.create({
      ...req.body,
      categoryImage: req.body.categoryImage || "", // Fill with empty string if null
      navimage: req.body.navimage || "", // Fill with empty string if null

    });
    return res.json({ message: "CategoryImage created successfully", categoryImage: newCategoryImage });
  }
};


// Define the DELETE request handler for removing a comments entry
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the categoryImageService
  const categoryImageService: CategoryImageService = req.scope.resolve("categoryImageService")
  
  // Extract the id from the query parameters
  const id = req.query.id as string;

  console.log("deleted by id ",req.query.id)

  // Delete the comments entry by its ID
  await categoryImageService.delete(id)

  // Return a 200 status to indicate successful deletion
  res.status(200).end()
}
