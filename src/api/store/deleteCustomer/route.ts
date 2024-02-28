import { CustomerService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerService = req.scope.resolve<CustomerService>("customerService");

  const id = req.body.id;
  console.log("id at body ", id);

  const customers = await customerService.list({});
  console.log("customers at customer_active ", customers);

  const customer = customers.find(customer => customer.id === id);
  console.log("customer found ", customer);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const currentDate = new Date(); // Get current date and time

  const customerDelete = await customerService.update(
    customer.id,
    { 
      email: `${customer.email}***`,
      customer_active: "true"
    }
  );

  // const customerDelete = await customerService.delete(customer.id);
  // console.log("customer Delete ", customerDelete);

  res.json({ customerDelete });
};
