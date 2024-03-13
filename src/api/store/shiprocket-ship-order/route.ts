// Import necessary types from the Medusa framework to work with HTTP requests and responses.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Import the function responsible for executing order shipment processes from a local module.
import { executeOrderShipment } from './shipOrder'

// Define an asynchronous function named POST, intended to be exported and used as an endpoint handler for POST requests.
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
    try {
        // Log a message indicating that the ship order API has been called. Useful for debugging or tracking API usage.
        console.log('called ship order API' );

        // Call the previously imported function, `executeOrderShipment`, passing in the request and response objects.
        // This function encapsulates the logic for shipping an order, including any interactions with databases or external services.
        await executeOrderShipment(req, res);

        // The following line is commented out. If uncommented, it would directly send a 200 OK HTTP status code
        // to the client, indicating successful completion of the request. It's assumed that response handling
        // is managed within `executeOrderShipment`, hence it's not needed here.
        // res.sendStatus(200);

    } catch (error) {
        // If any exceptions are thrown during the execution of `executeOrderShipment`, they are caught here.
        // The error is logged to the console, providing insights into what went wrong for debugging purposes.
        console.error('Failed to create order:', error);

        // Sends a 500 Internal Server Error HTTP status code to the client, along with a JSON object containing
        // a message about the failure and the specific error message. This informs the client that the request
        // could not be processed successfully due to an error.
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
}
