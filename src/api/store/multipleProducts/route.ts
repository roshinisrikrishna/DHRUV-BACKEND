import { ProductService, ProductVariantService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

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
  const color = req.body.color;


  const products = await productService.list({})




  if (typeof productId !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    // Retrieve the original product
    const originalProduct = products.find(product=>product.id === req.body.id)

    const variants = await productVariantService.list({});

    const originalVariant = variants.find(variant=>variant.id === req.body.variant_id)


    const originalVariants = await productVariantService.list({ product_id: productId });

    if (!originalProduct || !originalVariants || !Array.isArray(originalVariants)) {
      return res.status(404).json({ error: "Original product or variants not found" });
    }
    // res.json({originalVariant})


    // Process color and create a new handle
    const title = originalProduct.title.toLowerCase().replace(/\s+/g, '-');
    const processedColor = color.toLowerCase().replace(/\s+/g, '-');
    const newHandle = `${title}-${processedColor}-`;

    // Create a new product with modifications
    const newProductData = {
        ...originalProduct,
        id: undefined,
        handle: newHandle,
        multiple_product: true,
        images: null, // or []
        // other modifications...
    };

    const newProduct = await productService.create(newProductData);

    // Duplicate each variant for the new product
    for (const variant of originalVariants) {
        const newVariantData = {
          ...variant,
          id: undefined,
          product_id: newProduct.id, // Associate with new product
          // other modifications...
        };

        const newVariant = await productVariantService.create(newProduct.id,newVariantData)
      
        await productVariantService.create(newProduct.id, newVariantData);
    }
    // res.json({})

    res.status(200).json({ message: "Product duplicated successfully", newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};