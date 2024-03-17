// Imports necessary services and types from the Medusa framework.
import { ProductService, ProductVariantService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Asynchronously handles a GET request to list products.
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  // Resolves the ProductService from Medusa's service container to use its methods.
  const productService = req.scope.resolve<ProductService>("productService");
  // Calls the `list` method to retrieve all products without any filters.
  const products = await productService.list({})
  // Sends the retrieved products as a JSON response.
  res.json({products})
}

// Asynchronously handles a POST request to update a product's handle based on the product ID and a new color.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolves the ProductService and ProductVariantService from Medusa's service container.
  const productService = req.scope.resolve<ProductService>("productService");
  const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService");

  // Extracts the product ID and color from the request body.
  const productId = req.body.id;
  const color = req.body.color;

  // Fetches a list of all products, which is later used to find the original product by ID.
  const products = await productService.list({})
  console.log('products', products);
  console.log('req.body', req.body);

  try {
    // Attempts to find the product by ID in the fetched list.
    let originalProduct = products.find(product => product.id === req.body.id);

    // If the product isn't found in the list, it tries to fetch it directly by ID.
    if (!originalProduct) {
      originalProduct = await productService.retrieve(req.body.id);
    }

    console.log('originalProduct', originalProduct);

    // Processes the provided color into a format suitable for a URL handle.
    const processedColor = color.toLowerCase().replace(/\s+/g, '-');
    // Creates a new handle by appending the processed color to the original product's handle.
    const newHandle = `${originalProduct.handle}-${processedColor}`;
    console.log('newHandle', newHandle);

    // Updates the product's handle with the new value.
    const updatedProduct = await productService.update(productId, { handle: newHandle });
    // Sends the updated product as a JSON response.
    res.json({updatedProduct});
  } catch (error) {
    // Handles any errors that occur during the process, sending a 500 status code and the error message.
    res.status(500).json({ error: error.message });
  }
};
