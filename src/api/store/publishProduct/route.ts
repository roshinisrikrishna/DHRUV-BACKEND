import { ProductService, ProductVariantService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { Product } from "src/models/product";
import { ProductStatus } from "@medusajs/medusa";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const productService = req.scope.resolve<ProductService>("productService");
  const products = await productService.list({})
  res.json({products})

}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productService = req.scope.resolve<ProductService>("productService");
  const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService");

  // Extract productId and ensure it's a string
  const productId = req.body.id;

  const publishStatus = await ProductStatus.PUBLISHED
  console.log('publishStatus', publishStatus)
  const products = await productService.list({})
    console.log('products', products)
    console.log('req.body', req.body)

  try {
    let originalProduct = products.find(product=>product.id === req.body.id)

    if(!originalProduct)
    {
      originalProduct = await productService.retrieve(req.body.id)
    }

    console.log('originalProduct', originalProduct)

 
    const updatedProduct = await productService.update(productId,
        {
          status: publishStatus
        })
        res.json({updatedProduct})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};