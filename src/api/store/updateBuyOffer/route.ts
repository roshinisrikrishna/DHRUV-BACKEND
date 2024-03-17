// Import ProductService from MedusaJS for handling product-related operations
import { ProductService } from "@medusajs/medusa"
// Import type definitions for MedusaRequest and MedusaResponse from MedusaJS
import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"

// Define a GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Send a status code of 200 (OK) as the response
  res.sendStatus(200);
}
 
// Define a POST request handler
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the ProductService from the request's scope for product operations
  const productService = req.scope.resolve<ProductService>("productService");

  // Extract the product ID from the request body
  const id = req.body.id;
  // Log the product ID for debugging
  console.log("id at body ", id)
  
  // Retrieve a list of all products
  const products = await productService.list({})
  // Log the retrieved products for debugging
  console.log("products at buy_get_offer_number ", products)
  
  // Find the specific product with the matching ID
  const product = products.find(product => product.id === id);
  // Log the found product for debugging
  console.log("product found ", product)
  // Extract the product ID from the found product
  const productId = product.id;
  // Log the product ID for debugging
  console.log("product found id", productId)

  // Perform basic validation of the request body
  if (!productId || !req.body.buy_get_offer) {
    // Throw an error if the product ID or buy_get_offer is missing
    throw new Error("Missing product ID or buy_get_offer in request body");
  }
 
  // Update the product with the new buy_get_offer value
  const productUpdate = await productService.update(
    productId,
    { buy_get_offer: req.body.buy_get_offer }
  );
 
  // Log the updated product for debugging
  console.log("product Update ", productUpdate)
  // Send the updated product as a JSON response
  res.json({
    productUpdate,
  });
}
