// Import necessary services and types from MedusaJS
import { CartService, Cart } from "@medusajs/medusa"
import { ShippingOptionService } from "@medusajs/medusa"
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { LineItem } from "@medusajs/medusa"
import { handleEmail } from "./orderEmailSender"
import Medusa from "@medusajs/medusa-js"
const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 })

// Define an asynchronous POST request handler
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
   // Resolve the CartService from the request's scope to interact with cart data
   const cartService = req.scope.resolve<CartService>("cartService")
      
   // Retrieve all carts using the cart service
   const carts = await cartService.list({})
   console.log("carts ", carts)
   
   for (let cart of carts) {
    let cartId = cart.id;

    if(cartId)
    {
      medusa.carts.retrieve(cartId)
        .then(({ cart }) => {
   
          // Check if cart.email exists and cart.completed_at is null
          if (cart.email && !cart.completed_at) {
            // console.log('cart.items', cart.items);
            console.log("cart ", cart.id);
            console.log('cart.email', cart.email,' completed_at', cart.completed_at);
            
            // Create productInfo array with item details
            const productInfo = cart.items.map((item) => ({
              product_title: `${item.title} - ${item.description}`,
              product_id: item.variant.product_id,
            }));
            
            // Check if productInfo exists before calling handleEmail
            if (productInfo.length > 0) {
              // Call handleEmail function
              handleEmail(req, res, cart.email, productInfo);
            }
          }
        });
    }
    
   }
   

// Check if a cart is found
if (carts) {
  // If found, return the cart details in the response
  res.json({
    carts
  })
} else {
  // If not found, return a 404 status with an error message
  res.status(404).json({
    message: 'Cart not found',
  })
}
}
