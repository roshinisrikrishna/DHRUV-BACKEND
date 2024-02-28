// Import types for MedusaRequest and MedusaResponse from MedusaJS
import type { 
    MedusaRequest, 
    MedusaResponse,
} from "@medusajs/medusa"

// Import the rateCalculation function from a local file
import { getCourierId } from './getCourierId';

// Import ShippingOptionService from MedusaJS
import { ShippingOptionService } from "@medusajs/medusa";

// Define an asynchronous POST function to handle POST requests
export const GET = async (
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
) => {
  
  // Call the rateCalculation function, passing in the request and response
  getCourierId(req, res);
}
