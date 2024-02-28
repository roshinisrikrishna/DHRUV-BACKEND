// Import necessary services and types from MedusaJS
import { CartService, Cart } from "@medusajs/medusa"
import { ShippingOptionService } from "@medusajs/medusa"
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

// Define an asynchronous GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Extract the cart ID from the request body
  const id = req.body.id;
  console.log("id at body ", id)
 
  // Resolve the CartService from the request's scope to interact with cart data
  const cartService = req.scope.resolve<CartService>("cartService")
      
  // Retrieve all carts using the cart service
  const carts = await cartService.list({})
  console.log("carts at password ", carts)
  
  // Find the specific cart with the matching ID
  const cart = carts.find(cart => cart.id === id);
  console.log("cart found ", cart)
  const cartId = cart.id;
  console.log("cart found id", cartId)

  // Check if a cart is found
  if (cart) {
    // If found, return the cart details in the response
    res.json({
      cart
    })
  } else {
    // If not found, return a 404 status with an error message
    res.status(404).json({
      message: 'Cart not found',
    })
  }
}

// Define an asynchronous POST request handler
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Extract the shipping option ID and the amount from the request body
  const id = req.body.id;
  const amount = req.body.amount;

  // Convert the amount to an integer for consistency
  const roundedAmount = Math.round(amount);

  // Resolve the ShippingOptionService from the request's scope
  const shippingOptionService = req.scope.resolve<ShippingOptionService>("shippingOptionService")
  // Retrieve all shipping options
  const ships = await shippingOptionService.list({});
  console.log("ships at password ", ships);

  try {
    // Update the shipping option with the provided ID and new details
    const ship = await shippingOptionService.update(
        id,
        {
            amount: roundedAmount,
            name: req.body.name,
        }
    );

    // Return the updated shipping option in the response
    res.json({
        cart: ship,
    });
  } catch (error) {
    // Log and return an error message if the update fails
    console.error("Error updating shipping option:", error);
    res.status(500).json({
        message: "Error updating shipping option"
    });
  }
};
