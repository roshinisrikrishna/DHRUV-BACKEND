// Import necessary services and types from the Medusa framework.
import { CustomerService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
// Import the Medusa client library for JavaScript.
import Medusa from "@medusajs/medusa-js"
import { MEDUSA_BACKEND_URL } from "../config";

// Initialize a new Medusa client with the specified base URL and maximum retry attempts.
const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })

// Define an asynchronous function named POST, which handles incoming HTTP POST requests.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the CustomerService from Medusa's service layer, which allows for customer management.
  const customerService = req.scope.resolve<CustomerService>("customerService");

  // Extract the email address from the request body.
  const email = req.body.email;
  console.log("email at body ", email);

  // Retrieve a list of all customers using the customer service. This is currently only logged, not used.
  const customers = await customerService.list({});
  console.log("customers at customer_active ", customers);

  // The following commented-out code would find a customer by their email and handle the case where the customer doesn't exist.
  // const customer = customers.find(customer => customer.email === email);
  // console.log("customer found ", customer);
  // if (!customer) {
  //   throw new Error("Customer not found");
  // }

  // Create a new customer using the Medusa client. Note that the customer details are hard-coded in this example.
  const customerCreate = await medusa.customers.create({
    first_name: "Alec",
    last_name: "Reynolds",
    email: "roshinisparx@gmail.com",
    password: "admin12344"
  })
  .then(({ customer }) => {
    console.log(customer.id); // Log the ID of the newly created customer.
  })
  const currentDate = new Date(); // Retrieve the current date and time, though it's not used later in the snippet.

  // The following commented-out code would update the found customer to be active or delete them, but it's currently disabled.
  // const customerDelete = await customerService.update(
  //   customer.id,
  //   { 
  //     customer_active: "true", 
  //     deleted_at: null // assuming customerService.update can handle this
  //   }
  // );
  // const customerDelete = await customerService.delete(customer.id);
  // console.log("customer Delete ", customerDelete);

  // Respond with a JSON object containing the list of customers, regardless of the newly created customer.
  res.json({ customers });
};
