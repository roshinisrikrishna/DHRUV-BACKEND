// Import necessary services, types, and models from the Medusa framework.
import { ProductService, ProductVariantService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
// The Product model import seems unused in the snippet provided.
import { Product } from "src/models/product";
// ProductStatus is used to handle product statuses within Medusa.
import { ProductStatus } from "@medusajs/medusa";

// Asynchronously handles a GET request.
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  // Resolves the ProductService to interact with product data.
  const productService = req.scope.resolve<ProductService>("productService");
  // Retrieves all products without applying any filters.
  const products = await productService.list({})
  // Sends the list of products as a JSON response.
  res.json({products})
}
// Asynchronously handles a POST request.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolves necessary services for product and variant management.
  const productService = req.scope.resolve<ProductService>("productService");
  const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService");

  // Extracts the product ID from the request body.
  const productId = req.body.id;

  // The ProductStatus.DRAFT seems to be mistakenly awaited; ProductStatus.DRAFT is likely a static property.
  const draftStatus = await ProductStatus.DRAFT
  console.log('draftStatus', draftStatus)
  // Retrieves a list of all products for logging purposes, but it's not utilized further.
  const products = await productService.list({})
  console.log('products', products)
  console.log('req.body', req.body)

  try {
    // Attempts to find the specific product from the list or fetches it directly if not found in the list.
    let originalProduct = products.find(product=>product.id === req.body.id)

    if(!originalProduct) {
      originalProduct = await productService.retrieve(req.body.id)
    }

    console.log('originalProduct', originalProduct)

    // Updates the product's status to DRAFT.
    const updatedProduct = await productService.update(productId, { status: draftStatus })
    // Responds with the updated product information.
    res.json({updatedProduct})
  } catch (error) {
    // Handles any errors that occur during the update process.
    res.status(500).json({ error: error.message });
  }
};
