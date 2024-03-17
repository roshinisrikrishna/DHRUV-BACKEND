// Import the MedusaRequest and MedusaResponse types from the @medusajs/medusa package.
// These are used for typing the request and response objects in the Medusa e-commerce framework.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Import the cancelShip function from another file named 'cancelShip'.
// This function is presumably responsible for canceling a shipment.
import { cancelShip } from './cancelShip'

// Export an asynchronous function named POST, which is intended to handle HTTP POST requests.
// The function takes a request (req) and response (res) object as arguments,
// both typed according to Medusa's request/response conventions.
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
    try {
      // Within a try block, call the imported cancelShip function,
      // passing the request and response objects to it. This attempts to cancel a shipment
      // and is awaited to ensure the operation completes before proceeding.
      await cancelShip(req,res); // Call the function from cancelShip.js

      // Commented out: Initially sends a success status code (200) back to the client if the operation succeeds.
      // This line is commented out because the response handling is presumably done within the cancelShip function itself.
      // res.sendStatus(200); // Send success status if order creation succeeds

    } catch (error) {
      // Catch any errors that occur during the try block execution.
      // Log the error to the console for debugging purposes.
      console.error('Failed to create order:', error);
      
      // Send a 500 Internal Server Error status code back to the client,
      // along with a JSON object containing a message and the error message.
      // This informs the client that the operation failed.
      res.status(500).json({ message: 'Failed to create order', error: error.message }); // Send error response
    }
  }
