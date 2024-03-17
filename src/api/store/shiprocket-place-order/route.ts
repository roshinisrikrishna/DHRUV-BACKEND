// Import the necessary types from the Medusa framework to work with request and response objects.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Import the `executeOrderCreation` function from a local module named `createOrder`.
// This function is responsible for the business logic associated with creating an order.
import { executeOrderCreation } from './createOrder'

// Define an asynchronous function named POST. This function is exported so it can be used by the Medusa framework
// as an endpoint handler for POST requests.
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
    try {
      // Calls the `executeOrderCreation` function, passing the request and response objects to it.
      // This function encapsulates the process of creating an order and is awaited to ensure
      // it completes before proceeding.
      await executeOrderCreation(req, res);

      // The following line is commented out. If it were included and uncommented, it would send a 200 OK HTTP status code
      // back to the client to indicate successful order creation. However, because the response handling
      // is presumably done within `executeOrderCreation`, it's unnecessary here.
      // res.sendStatus(200);

    } catch (error) {
      // If an error occurs during the execution of `executeOrderCreation`, it is caught here.
      // The error is logged to the console for debugging purposes.
      console.error('Failed to create order:', error);

      // The client is then sent a 500 Internal Server Error status code along with a JSON object
      // that includes a message about the failure and the error message itself. This provides
      // feedback to the client that the order creation failed.
      res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
}
