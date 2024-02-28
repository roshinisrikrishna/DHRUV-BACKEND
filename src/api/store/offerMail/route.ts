// Import type definitions for MedusaRequest and MedusaResponse from MedusaJS
import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"
import { ProductService, ProductVariantService } from "@medusajs/medusa";
import axios from 'axios';
// Import the handleEmail function from a local file
import { handleEmail } from './orderEmailSender.js';
import Medusa from "@medusajs/medusa-js"

const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 })

// Define an asynchronous GET function to handle GET requests
export async function GET(
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
): Promise<void> {
  // Send a status code of 200 (OK) as the response
  res.sendStatus(200);
}

// Define a POST function to handle POST requests
export const POST = async (
  req: MedusaRequest, // The request object
  res: MedusaResponse // The response object
) => {
  // Log the request body to the console for debugging
  // console.log("body at server ", req.body)
  const productService = req.scope.resolve<ProductService>("productService");
  const products = await productService.list({})

  const productVariantService = req.scope.resolve<ProductVariantService>("productVariantService");
  const productVariants = await productVariantService.list({})

  const apiUrl = "http://195.35.20.220:9000/store/wishlist";

  // Make a GET request to the API
  axios
    .get(apiUrl)
    .then(async (response) => {
      // Handle the successful response here
      console.log("GET request successful");
      const wishlists = response.data.wishlists;

      // Create an object to store combined variant_ids for each email
      const emailVariantMap = {};

      // Create an object to store combined product information for each email
      const emailProductMap = {};

      // Iterate through wishlists to combine product and variant information
     // ...

// Iterate through wishlists to combine product and variant information
for (const wishlist of wishlists) {
  const { email, variant_id } = wishlist;

  medusa.products.variants.retrieve(variant_id)
    .then(({ variant }) => {
      // Create an object to store variant information
      const variantInfo = {
        product_id: variant.product_id,
        product_title: variant.product.title
      };

      // Combine product_id and product title into a single string
      const productInfo = `${variantInfo.product_id} - ${variantInfo.product_title}`;

      if (!emailProductMap[email]) {
        // Initialize with the first product info for this email
        emailProductMap[email] = [variantInfo];
      } else {
        // Add the product info to the existing array for this email
        emailProductMap[email].push(variantInfo);
      }

      // Check if this is the last variant for this email
      if (emailProductMap[email].length === wishlists.filter(w => w.email === email).length) {
        // Call the handleEmail function with email, combined titles, and combined product info
        if (email && emailProductMap[email]) {
          console.log("emailProductMap[email] ", emailProductMap[email]);
          handleEmail(req, res, email, emailProductMap[email]);
        }
      }
    });
}

// ...

      console.log('emailVariantMap', emailVariantMap);

    })

  // Call the handleEmail function, passing in the request and response objects
  handleEmail(req, res);

}
