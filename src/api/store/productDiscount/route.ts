// Import necessary types for handling Medusa requests and responses.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
// Import the Medusa client to communicate with the Medusa server.
import Medusa from "@medusajs/medusa-js";

// Define an asynchronous GET function for handling incoming requests.
export async function GET(
  req: MedusaRequest, // The incoming request object.
  res: MedusaResponse // The response object to send data back to the client.
): Promise<void> {
  // Initialize a new instance of the Medusa client with the server's base URL and retry configurations.
  const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });

  try {
    // Attempt to create a session using admin credentials and retrieve the API token.
    const sessionResponse = await medusa.admin.auth.createSession({
      email: 'admin@hb.com',
      password: 'admin'
    });
    const user = sessionResponse.user; // Extract the user from the session response.
    let api_token = user.api_token; // Extract the API token for later use.

    // Reinitialize the Medusa client with the obtained API token for authenticated requests.
    const medusaAccessed = new Medusa({ 
      baseUrl: "http://195.35.20.220:9000",
      maxRetries: 3,
      apiKey: api_token
    });

    // Unused constant placeholders for discount and condition IDs.
    const discountId = "disc_01HMHBMZZ5HXN5155FKC23QZYM";
    let discId = req.query.discount_id; // Extract the discount ID from the request query.

    const conditionId = "discon_01HMHBMZZEY9SRSPX7SZYHASRA";
    let conId = req.query.conditionId; // Extract the condition ID from the request query.

    // Asynchronously retrieve the discount condition from the Medusa server, including related products.
    const discountConditionResponse = await medusaAccessed.admin.discounts.getCondition(
      `${discId}`, // Use the discount ID from the request query.
      `${conId}`, // Use the condition ID from the request query.
      {
        expand: "products", // Specify to include related products in the response.
      }
    )
    .then(({ discount_condition }) => {
      // This then block processes the response from the Medusa server.
      // It was intended to log information but has been commented out.

      // Respond with the related products if they exist; otherwise, indicate no products are associated.
      if (discount_condition.products) {
        res.status(200).json({ products: discount_condition.products });
      } else {
        res.status(200).json({ status: "No products" });
      }
    });

    // This line was intended to log the response but has been commented out.
  } catch (error) {
    // Catch and log any errors that occur during the process.
    console.error("Error:", error);
    // Respond with a 500 Internal Server Error status and an error message.
    res.status(500).json({ error: "Internal Server Error" });
  }
}
