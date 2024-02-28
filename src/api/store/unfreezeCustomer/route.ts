import { CustomerService } from "@medusajs/medusa";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js"
const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 })


export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const customerService = req.scope.resolve<CustomerService>("customerService");

  const email = req.body.email;
  console.log("email at body ", email);

  const customers = await customerService.list({});
  console.log("customers at customer_active ", customers);

  // const customer = customers.find(customer => customer.email === email);
  // console.log("customer found ", customer);

  // if (!customer) {
  //   throw new Error("Customer not found");
  // }

  const customerCreate = await medusa.customers.create({
    first_name: "Alec",
    last_name: "Reynolds",
    email: "roshinisparx@gmail.com",
    password: "admin12344"
  })
  .then(({ customer }) => {
    console.log(customer.id);
  })
  const currentDate = new Date(); // Get current date and time

  // const customerDelete = await customerService.update(
  //   customer.id,
  //   { 
  //     customer_active: "true", 
  //     deleted_at: null // assuming customerService.update can handle this
  //   }
  // );

  // const customerDelete = await customerService.delete(customer.id);
  // console.log("customer Delete ", customerDelete);

  res.json({ customers });
};
