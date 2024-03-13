// Import the MedusaRequest and MedusaResponse types from the Medusa framework.
// These types are used to annotate the request and response objects, providing type checking and intellisense.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Import the getOrder function from another file. This function is expected to handle the logic for fetching order details.
import { getOrder } from './getOrder'

// Define an asynchronous function named GET, which is exported for use elsewhere in the application.
// This function is designed to handle GET requests, taking a MedusaRequest object and a MedusaResponse object as parameters.
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
    try {
      // Call the getOrder function, passing along the request and response objects.
      // This delegates the handling of the GET request to the getOrder function.
      await getOrder(req, res);

      // The following line is commented out but would normally send a 200 OK status code back to the client,
      // indicating that the request was successfully processed. It's unnecessary here because the getOrder function
      // is expected to handle the response itself.
      // res.sendStatus(200);
    } catch (error) {
      // If any error occurs during the execution of the getOrder function, log the error message to the console.
      console.error('Failed to create order:', error);

      // Respond to the client with a 500 Internal Server Error status code and a JSON object containing the error message.
      // This provides the client with feedback that something went wrong while processing the request.
      res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
}
