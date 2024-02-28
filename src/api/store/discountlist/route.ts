import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Initialize userId as undefined
  const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });

  // Create a session and obtain the user's API token
  try {
    const sessionResponse = await medusa.admin.auth.createSession({
      email: 'admin@hb.com',
      password: 'admin'
    });
    const user = sessionResponse.user;
    let api_token = user.api_token;

    // Initialize Medusa with the obtained API token
    const medusaAccessed = new Medusa({ 
      baseUrl: "http://195.35.20.220:9000",
      maxRetries: 3,
      apiKey: api_token
    });

    // Retrieve discounts
    const discountsResponse = await medusaAccessed.admin.discounts.list();
    const discounts = discountsResponse.discounts;

    // console.log('discounts', discounts)
    if (discounts.length === 0) {
      // No discounts available
      res.status(200).json({ status: "No discounts available" });
    } else {
      // Send the discounts as a response
      res.status(200).json({ discounts });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
