import Medusa from "@medusajs/medusa-js";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { MEDUSA_BACKEND_URL } from "../config";

const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
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

    // Send reset password token
    await medusaAccessed.admin.users.sendResetPasswordToken({
      email: "roshinisrikrishna@gmail.com"
    });

    // List users
    const usersResponse = await medusaAccessed.admin.users.list();
    console.log("users ", usersResponse.users);

    res.status(200).json({ message: "Reset password token sent successfully", users: usersResponse.users });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
