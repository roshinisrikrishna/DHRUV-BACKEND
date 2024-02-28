// Import necessary types and services
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { WishlistRepository } from "../../../repositories/wishlist"
import { EntityManager } from "typeorm"
import WishlistService from "../../../services/wishlist"

// Define the GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {


  // Resolve the WishlistRepository and EntityManager from Medusa's dependency injection system
  const wishlistRepository = req.scope.resolve<typeof WishlistRepository>("wishlistRepository");
  const manager = req.scope.resolve<EntityManager>("manager")
  const wishlistRepo = manager.withRepository(wishlistRepository)
  
  // Extract customer_id and variant_id from query parameters
  const params_id = req.query.customer_id as string;
  const variant_id = req.query.variant_id as string;

  

  console.log("params_id ",params_id)
  console.log("variant_id ",variant_id)

  // Handle different scenarios based on the provided query parameters
  if (params_id && variant_id) {
    // Find wishlist entries for a specific customer and variant
    const existingWishlist = await wishlistRepo.find({
      where: {
        customer_id: params_id,
        variant_id: variant_id
      }
    });

    if (existingWishlist) {
      // Return the found wishlist entries
      return res.json({ data: existingWishlist });
    }
  } else if (params_id) {
    // If only customer_id is provided, find all wishlist entries for that customer
    const wishlist = await wishlistRepo.find({ where: { customer_id: params_id } });

    if (!wishlist) {
      // If no wishlist is found, return a 404 status
      return res.status(404).end();
    }

    res.json({
      wishlist: wishlist,
    })
  } else {
    // If no specific query parameters, return all wishlist entries
    res.json({
      wishlists: await wishlistRepo.find(),
    })
  }
}

// Define the POST request handler for creating a new wishlist entry
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the WishlistService
  const wishlistService: WishlistService = req.scope.resolve("wishlistService")
  console.log("req body POST ",req.body)

  // Basic validation of request body
  if (!req.body.customer_id || !req.body.variant_id || !req.body.email) {
    throw new Error("`customer_id` and `variant_id` are required.")
  }

  // Create a new wishlist entry
  const wishlist = await wishlistService.create(req.body)

  // Return the created wishlist entry
  res.json({
    wishlist,
  })
}

// Define the DELETE request handler for removing a wishlist entry
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the WishlistService
  const wishlistService: WishlistService = req.scope.resolve("wishlistService")
  
  // Extract the id from the query parameters
  const id = req.query.id as string;

  console.log("deleted by id ",req.query.id)

  // Delete the wishlist entry by its ID
  await wishlistService.delete(id)

  // Return a 200 status to indicate successful deletion
  res.status(200).end()
}
