import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";
import { MEDUSA_BACKEND_URL } from "../config";


export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Initialize userId as undefined
  const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });

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
      baseUrl: MEDUSA_BACKEND_URL,
      maxRetries: 3,
      apiKey: api_token
    });

    // Retrieve discounts
    const discountId = "disc_01HMHBMZZ5HXN5155FKC23QZYM"
    let discId = req.query.discount_id;

    const conditionId = "discon_01HMHBMZZEY9SRSPX7SZYHASRA"
    let conId = req.query.conditionId;

    const discountConditionResponse = await medusaAccessed.admin.discounts.getCondition(
      `${discId}`, 
      `${conId}`,
      {
        expand: "customer_groups",
      }
    )
    .then(({ discount_condition }) => {
      console.log(
        "discount_condition.id", discount_condition.id, "discount_condition.customers ",
        discount_condition.customer_groups
      );

      // Check if discount_condition.products exist
      if (discount_condition.customer_groups) {
        res.status(200).json({ customer_groups: discount_condition.customer_groups });
      } else {
        res.status(200).json({ status: "No customer_groups" });
      }
    })

    // console.log("discountConditionResponse ", discountConditionResponse);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
