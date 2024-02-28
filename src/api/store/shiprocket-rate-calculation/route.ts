// Import types for MedusaRequest and MedusaResponse from MedusaJS
import type { 
    MedusaRequest, 
    MedusaResponse,
} from "@medusajs/medusa"

// Import the rateCalculation function from a local file
import { rateCalculation } from './rateCalculation';

// Import ShippingOptionService from MedusaJS
import { ShippingOptionService } from "@medusajs/medusa";

// Define an asynchronous GET function to handle GET requests
export async function GET(
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
): Promise<void> {
  // Resolve the ShippingOptionService from the request's scope
  const shippingOptionService = req.scope.resolve<ShippingOptionService>("shippingOptionService");

  // Retrieve a list of shipping options using the shipping option service
  const shipping_options = await shippingOptionService.list({})

  // Log the retrieved shipping options to the console
  console.log("shipping_options at buy_get_offer_number ", shipping_options)

  // Send the shipping options in the response as JSON
  res.json({
      shipping_options
  })
  // Note: The following line is commented out and not used
  // res.sendStatus(200);
}

// Define an asynchronous POST function to handle POST requests
export const POST = async (
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
) => {
  // Resolve the ShippingOptionService from the request's scope
  const shippingOptionService = req.scope.resolve<ShippingOptionService>("shippingOptionService");

  // Retrieve a list of shipping options using the shipping option service
  const shipping_options = await shippingOptionService.list({})

  // Log the retrieved shipping options to the console
  console.log("shipping_options at buy_get_offer_number ", shipping_options)

  // Log the request body to the console
  console.log("body at server ", req.body)
  
  // Call the rateCalculation function, passing in the request and response
  rateCalculation(req, res);
}
