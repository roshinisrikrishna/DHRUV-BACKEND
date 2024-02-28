// Import CustomerService from MedusaJS for customer-related operations
import { CustomerService } from "@medusajs/medusa"
// Import type definitions for MedusaRequest and MedusaResponse from MedusaJS
import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"

// Define an asynchronous GET request handler
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Extract the email from the request body
  const email = req.body.email;
  console.log("email at body ", email)
 
  // Resolve the CustomerService from the request's scope
  const customerService = req.scope.resolve<CustomerService>("customerService")
      
  // Retrieve all customers
  const customers = await customerService.list({})
  // console.log("customers at password ", customers)
  
  // Find the specific customer with the matching email
  const customer = customers.find(customer => customer.email === email);
  console.log("customer found ", customer)
  console.log("customer pasword ", customer.password_hash)

  // const customerId = customer.id;
  // console.log("customer found id", customerId)

  // Check if a customer is found
  if (customer) {
    // Return the customer details in the response
    res.json({
      customer
    })
  } else {
    // If no customer is found, return a 404 status with an error message
    res.status(404).json({
      message: 'Customer not found',
    })
  }
}
 
// Define an asynchronous POST request handler
// Define an asynchronous POST request handler
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the CustomerService from the request's scope
  const customerService = req.scope.resolve<CustomerService>("customerService");
 
  // Extract the email from the request body
  const email = req.body.email;
  console.log("email at body ", email)
  
  // Retrieve all customers
  const customers = await customerService.list({})
  console.log("customers at password ", customers)
  
  // Find the specific customer with the matching email
  const customer = customers.find(customer => customer.email === email);
  console.log("customer found ", customer)
  const customerId = customer.id;
  console.log("customer found id", customerId)
 
  // Basic validation of the request body
  if (!customerId || !req.body.password) {
    // Throw an error if the customer ID or password is missing
    throw new Error("Missing customer ID or password in request body");
  }
  
  // Update the customer's password and active status
  const customerUpdate = await customerService.update(
    customerId,
    { password: req.body.password, customer_active: customer.customer_active }
  );
  
  console.log("customer Update ", customerUpdate)
  // Return the updated customer details in the response
  res.json({
    customerUpdate,
  });
 }
 