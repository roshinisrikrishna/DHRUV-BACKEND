import Medusa from "@medusajs/medusa-js";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { MEDUSA_BACKEND_URL } from "../config";

const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });
console.log('MEDUSA_BACKEND_URL', MEDUSA_BACKEND_URL)
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // Create a session to get the API token
    const sessionResponse = await medusa.admin.auth.createSession({
      email: 'admin@hb.com',
      password: 'admin'
    });

    const user = sessionResponse.user;
    let api_token = user.api_token;

    // Initialize Medusa with the obtained API token
    const medusaAccessed = new Medusa({ 
      baseUrl: MEDUSA_BACKEND_URL,
      maxRetries: 3,
      apiKey: api_token
    });

    // Get shipping options
    const shippingOptionsResponse = await medusaAccessed.admin.shippingOptions.list();

    // Check if shipping options are available and log their count
    if (shippingOptionsResponse.shipping_options) {
      console.log("Number of shipping options:", shippingOptionsResponse.shipping_options);
    }

    // Respond with shipping options
    res.status(200).json({ message: "Shipping options retrieved successfully", shipping_options: shippingOptionsResponse.shipping_options });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
