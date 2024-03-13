// Import the CustomerService class from the Medusa package to interact with customer data.
import { CustomerService } from "@medusajs/medusa";

// Import types for MedusaRequest and MedusaResponse from Medusa, for typing request and response objects.
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

// Define and export an asynchronous function named POST. This function handles HTTP POST requests,
// taking a MedusaRequest and MedusaResponse object as parameters.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the customerService from the request's scope to use Medusa's customer services.
  const customerService = req.scope.resolve<CustomerService>("customerService");

  // Extract the customer ID from the request body.
  const id = req.body.id;
  console.log("id at body ", id); // Log the customer ID for debugging.

  // Retrieve a list of all customers using the customer service.
  const customers = await customerService.list({});
  console.log("customers at customer_active ", customers); // Log the retrieved customers for debugging.

  // Find the customer with the matching ID from the list of all customers.
  const customer = customers.find(customer => customer.id === id);
  console.log("customer found ", customer); // Log the found customer for debugging.

  // If no customer is found with the provided ID, throw an error.
  if (!customer) {
    throw new Error("Customer not found");
  }

  // Get the current date and time.
  const currentDate = new Date();

  // Update the customer's information by appending '***' to their email and setting 'customer_active' to true.
  // Note: This approach anonymizes the email and incorrectly sets a boolean value as a string, which might be a mistake or oversight.
  const customerDelete = await customerService.update(
    customer.id,
    { 
      email: `${customer.email}***`,
      customer_active: "true" // This should likely be a boolean true, not a string "true".
    }
  );

  // The below commented-out lines suggest an alternative or previous approach was to delete the customer.
  // This has been replaced with updating the customer's record instead.
  // const customerDelete = await customerService.delete(customer.id);
  // console.log("customer Delete ", customerDelete);

  // Respond to the request with a JSON object containing the updated customer information.
  res.json({ customerDelete });
};
