import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ProductService } from "@medusajs/medusa"


export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {

      // Resolve the ProductService from the request's scope for product operations
  const productService = req.scope.resolve<ProductService>("productService");

  // Extract the product ID from the request body
  const id = req.body.id;
  // Log the product ID for debugging
//   console.log("id at body ", id)
  
  // Retrieve a list of all products
  const products = await productService.list({})
  // Log the retrieved products for debugging
//   console.log("products at video ", products)
  
  // Find the specific product with the matching ID
  const product = products.find(product => product.id === id);
  // Log the found product for debugging
  console.log("product found ", product)
  // Extract the product ID from the found product
  const productId = product.id;
  // Log the product ID for debugging
//   console.log("product found id", productId)

  // Perform basic validation of the request body
  if (!productId || !req.body.video) {
    // Throw an error if the product ID or video is missing
    throw new Error("Missing product ID or video in request body");
  }
 
  // Update the product with the new video value
  const productUpdate = await productService.update(
    productId,
    { video: req.body.video }
  );
 
  // Log the updated product for debugging
  console.log("product Update ", productUpdate)
  // Send the updated product as a JSON response
  res.json({
    productUpdate,
  });
//   res.sendStatus(200);
}
