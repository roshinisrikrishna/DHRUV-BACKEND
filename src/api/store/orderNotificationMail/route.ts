// Import type definitions for MedusaRequest and MedusaResponse from MedusaJS
import type { 
    MedusaRequest, 
    MedusaResponse,
  } from "@medusajs/medusa"
  
  // Import the handleEmail function from a local file
  import { handleEmail } from './orderEmailSender.js';
  
  // Define an asynchronous GET function to handle GET requests
  export async function GET(
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
  ): Promise<void> {
  // Send a status code of 200 (OK) as the response
  res.sendStatus(200);
  }
  
  // Define a POST function to handle POST requests
  export const POST = (
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
  ) => {
  // Log the request body to the console for debugging
  console.log("body at server ", req.body)
  
  // Call the handleEmail function, passing in the request and response objects
  handleEmail(req, res);
  }
  