import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { cancelShip } from './cancelShip'

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
    try {
      await cancelShip(req,res); // Call the function from createOrder.js
    //   res.sendStatus(200); // Send success status if order creation succeeds
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ message: 'Failed to create order', error: error.message }); // Send error response
    }
  }