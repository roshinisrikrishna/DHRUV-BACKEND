// Import ProductService from MedusaJS for handling product-related operations
import { UserService } from "@medusajs/medusa"
// Import type definitions for MedusaRequest and MedusaResponse from MedusaJS
import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"

// Define an asynchronous function for handling GET requests
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Send a status code of 200 (OK) as the response
  res.sendStatus(200);
}
 
// Define an asynchronous function for handling POST requests
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the ProductService from the request's scope for product operations
  const userService = req.scope.resolve<UserService>("userService");

  // Extract the user ID from the request body
  const id = req.body.id;
  // Log the user ID for debugging purposes
  console.log("id at body ",id)
 
  console.log("req body at user ",req.body)
  // Retrieve a list of all users using the userService
  const users = await userService.list({})
  // Log the retrieved users for debugging purposes
  console.log("users at order_access ",users)
  
  // Find the user with the matching ID from the list of users
  const user = users.find(user => user.id === id);
  // Log the found user for debugging purposes
  console.log("user found ",user)
  // Extract the ID of the found user
  const userId = user.id;
  // Log the ID of the found user for debugging purposes
  console.log("user found id",userId)

  // Perform basic validation to check if userId and order_access are provided in the request body
  if (!userId ) {
    // Throw an error if either userId or order_access is missing
    throw new Error("Missing user ID or order_access in request body");
  }
 
  // Update the user with the given ID using the order_access value from the request body
 const userUpdate = await userService.update(
   userId,
   {
     order_access: req.body.order_access,
     products_access: req.body.products_access,
     customers_access: req.body.customers_access,
     discounts_access: req.body.discounts_access,
     giftcards_access: req.body.giftcards_access,
     pricing_access: req.body.pricing_access,
     analytics_access: req.body.analytics_access,
     user_access: req.body.user_access,
     settings_access: req.body.settings_access
   }
 );

 res.json({
   userUpdate,
 });
}
