// Import necessary services and types from Medusa, including the Product model and ProductStatus enum.
import { ProductService, ProductVariantService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ProductStatus } from "@medusajs/medusa";

// Asynchronously defines a function to handle GET requests.
export async function GET(
  req: MedusaRequest, // The incoming request.
  res: MedusaResponse // The outgoing response.
): Promise<void> {
  // Resolve the ProductService to interact with product data.
  const productService = req.scope.resolve<ProductService>("productService");
  // Retrieve a list of all products without any filter.
  const products = await productService.list({});
  // Respond with the retrieved products in JSON format.
  res.json({products});
}

// Asynchronously defines a function to handle POST requests.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve services for interacting with product and product variant data.
  const productService = req.scope.resolve<ProductService>("productService");
  const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService");

  // Extract the productId from the request body. Assuming it's provided in the body.
  const productId = req.body.id;

  // Retrieve the 'PUBLISHED' status from the ProductStatus enum for use in product updates.
  const publishStatus = await ProductStatus.PUBLISHED;
  console.log('publishStatus', publishStatus);

  // Retrieve a list of all products for logging/debugging.
  const products = await productService.list({});
  console.log('products', products);
  console.log('req.body', req.body);

  try {
    // Attempt to find the product by ID in the previously retrieved list.
    let originalProduct = products.find(product => product.id === req.body.id);

    // If the product wasn't found in the list, try retrieving it directly by ID from the service.
    if (!originalProduct) {
      originalProduct = await productService.retrieve(req.body.id);
    }
    console.log('originalProduct', originalProduct);

    // Update the product's status to 'PUBLISHED'.
    const updatedProduct = await productService.update(productId, { status: publishStatus });
    // Respond with the updated product details in JSON format.
    res.json({updatedProduct});
  } catch (error) {
    // Respond with an error status and message if something goes wrong.
    res.status(500).json({ error: error.message });
  }
};