// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { ColorImageRepository } from "../../../repositories/color_image"
import { EntityManager, Like } from "typeorm"
import ColorImageService from "src/services/color_image"

// Define the GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the ColorImageRepository and EntityManager from Medusa's dependency injection system
  const colorImageRepository = req.scope.resolve<typeof ColorImageRepository>("colorImageRepository");
  const manager = req.scope.resolve<EntityManager>("manager")
  const colorImageRepo = manager.withRepository(colorImageRepository)
  
  // Extract customer_id and option_id from query parameters
  const option_id = req.query.option_id as string;

  // console.log("option_id colorImage",option_id)

  // Handle different scenarios based on the provided query parameters
  if (req.query.option_id) {
    // Find colorImage entries for a specific customer and variant
  //   const existingColorImage = await colorImageRepo.find({
  //     where: {
  //       // Cast to string here to ensure type safety
  //   option_id: String(req.query.option_id),
  // }
  //   });

    const existingColorImage = await colorImageRepo.find({
      where: {
        option_id: Like(`%${option_id}%`),
      },
    });
    // console.log("option_id true ",option_id)

    
    if (existingColorImage) {
      // console.log("existing colorImage ",existingColorImage)
      // Return the found CoexistingColorImage entries
      return res.json({ data: existingColorImage });
    }
  }  else {
    // If no specific query parameters, return all colorImage entries
    // console.log("into else")
    res.json({
      colorImageList: await colorImageRepo.find(),
    })
  }
}

// Define the POST request handler for creating a new comments entry
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const colorImageService: ColorImageService = req.scope.resolve("colorImageService");
  const manager = req.scope.resolve<EntityManager>("manager");
  const colorImageRepo = manager.withRepository(ColorImageRepository);

  console.log("req body POST", req.body);

  // Basic validation of request body
  if (!req.body.option_id  ) {
    return res.status(400).json({ error: "`option_id`, `thumbnail`, and `color` are required." });
  }

  const { option_id, thumbnail, color } = req.body;

  // Check if an entry with the same option_id already exists
  const existingColorImage = await colorImageRepo.findOne({ where: { option_id } });

  if (existingColorImage) {
    // If exists, update the existing entry
    existingColorImage.thumbnail = thumbnail;
    existingColorImage.color = color;

    await colorImageRepo.save(existingColorImage);
    return res.json({ message: "ColorImage updated successfully", colorImage: existingColorImage });
  } else {
    // If not, create a new entry
    const newColorImage = await colorImageService.create(req.body);
    return res.json({ message: "ColorImage created successfully", colorImage: newColorImage });
  }
};


// Define the DELETE request handler for removing a comments entry
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the colorImageService
  const colorImageService: ColorImageService = req.scope.resolve("colorImageService")
  
  // Extract the id from the query parameters
  const id = req.query.id as string;

  console.log("deleted by id ",req.query.id)

  // Delete the comments entry by its ID
  await colorImageService.delete(id)

  // Return a 200 status to indicate successful deletion
  res.status(200).end()
}
