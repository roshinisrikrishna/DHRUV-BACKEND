import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";
import { handleEmail } from "./vipEmailSender";
// Define a type for the objects in customerData
type CustomerData = {
    count: number;
    totalAmount: number;
    customerId: string; // Add this line
  };

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
   ): Promise<void> {
    const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });
   
    try {
       const sessionResponse = await medusa.admin.auth.createSession({
         email: 'admin@hb.com',
         password: 'admin'
       });
       const user = sessionResponse.user;
       let api_token = user.api_token;
   
       const medusaAccessed = new Medusa({ 
         baseUrl: "http://195.35.20.220:9000",
         maxRetries: 3,
         apiKey: api_token
       });
   
       // Check if customer_id is provided in the query params
       if ('customer_id' in req.query && typeof req.query.customer_id === 'string') {
         const customerId = req.query.customer_id;
   
         // Fetch customer groups
         medusaAccessed.admin.customerGroups.list()
         .then(({ customer_groups }) => {
           // Find the customer group with the given id
           console.log('customer_groups', customer_groups)
           const customerGroup = customer_groups.find(group => group.id === req.query.group_id);
           medusaAccessed.admin.customerGroups.listCustomers(customerGroup.id)
            .then(({ customers }) => {
            console.log(customers);
            const customer = customers.find(customer => customer.id === req.query.customer_id);
            console.log('customer found', customer)

            if (customer) {
                res.status(200).json({ found: true });
              } else {
                res.status(200).json({ found: false });
              }

            })
           // Log the customer group
           console.log('Customer group:', customerGroup);
         })
         .catch(error => {
           console.error("Error retrieving customer groups:", error);
         });
       } else {
      console.error("Error: customer_id must be provided in the query params");
      res.status(400).json({ error: "Bad Request: customer_id must be provided in the query params" });
      return;
    }
 } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
 }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Initialize userId as undefined
  const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });

  // Create a session and obtain the user's API token
  try {
    const sessionResponse = await medusa.admin.auth.createSession({
      email: 'admin@hb.com',
      password: 'admin'
    });
    const user = sessionResponse.user;
    let api_token = user.api_token;

    // Initialize Medusa with the obtained API token
    const medusaAccessed = new Medusa({ 
      baseUrl: "http://195.35.20.220:9000",
      maxRetries: 3,
      apiKey: api_token
    });

// Retrieve orders
const ordersResponse = await medusaAccessed.admin.orders.list();
const orders = ordersResponse.orders;

// Filter orders that haven't been cancelled
const uncancelledOrders = orders.filter(order => order.canceled_at === null);

// Initialize an object to store the counts and totals
const customerData: Record<string, CustomerData> = {};

// Loop over the uncancelled orders
uncancelledOrders.forEach(order => {
 // Get the customer id
 const customerId = order.customer_id;

 // If the customer id is not in the object yet, initialize it
 if (!customerData[customerId]) {
    customerData[customerId] = { count: 0, totalAmount: 0, customerId }; // Add customerId here
 }

 // Increment the count and add the amount to the total
 customerData[customerId].count++;
 customerData[customerId].totalAmount += order.payments[0].amount;
});

// Now customerData contains the count and total amount for each customer id
console.log(customerData);

medusaAccessed.admin.customerGroups.list()
.then(({ customer_groups }) => {
 // Find the customer group with name 'VIP'
 const vipGroup = customer_groups.find(group => group.name === 'VIP');

 // If such a group exists, log its id
 if (vipGroup) {
    console.log("VIP group id:", vipGroup.id);

    // Find the customer with the highest count
const highestCountCustomer = Object.values(customerData).reduce((prev, curr) => (curr.count > prev.count) ? curr : prev);

// Find the customer with the highest total amount
const highestTotalAmountCustomer = Object.values(customerData).reduce((prev, curr) => (curr.totalAmount > prev.totalAmount) ? curr : prev);

// Prepare the list of customer ids to add to the VIP group
let customerIdsToAdd = [];

// Check if the highest count customer and the highest total amount customer are the same
if (highestCountCustomer.customerId !== highestTotalAmountCustomer.customerId) {
    // If they are not the same, add both of them
    customerIdsToAdd = [{ id: highestCountCustomer.customerId }, { id: highestTotalAmountCustomer.customerId }];
} else {
    // If they are the same, add only one of them
    customerIdsToAdd = [{ id: highestCountCustomer.customerId }];
}

medusaAccessed.admin.customerGroups.listCustomers(vipGroup.id)
.then(({ customers }) => {
 const customersToRemove = customers.filter(customer => 
    customer.id !== highestCountCustomer.customerId && 
    customer.id !== highestTotalAmountCustomer.customerId
 );
console.log('customers in vipGroup', customers)
console.log('customersToRemove', customersToRemove)
console.log('highestCountCustomer', highestCountCustomer)
console.log('highestTotalAmountCustomer', highestTotalAmountCustomer)
 customersToRemove.forEach(customer => {
    medusaAccessed.admin.customerGroups.removeCustomers(vipGroup.id, {
      customer_ids: [
        {
          id: customer.id
        }
      ]
    })
    .then(({ customer_group }) => {
      console.log(customer_group.id);
    })
    .catch(error => {
      console.error("Error removing customer from VIP group:", error);
    });
 });

 // Then add the customers that don't exist in the VIP group
 const customersToAdd = [highestCountCustomer, highestTotalAmountCustomer].filter(customer => 
    !customers.some(existingCustomer => existingCustomer.id === customer.customerId)
 );
console.log('customersToAdd', customersToAdd)
 customersToAdd.forEach(customer => {
    medusaAccessed.admin.customerGroups.addCustomers(vipGroup.id, {
      customer_ids: [
        {
          id: customer.customerId
        }
      ]
    })
    .then(({ customer_group }) => {
      console.log("Added customer to VIP group:", customer_group.id);
    })
    .catch(error => {
      console.error("Error adding customer to VIP group:", error);
    });
 });
})
.catch(error => {
 console.error("Error retrieving customers from VIP group:", error);
});

 } else {
    console.log("No VIP group found");
    medusa.admin.customerGroups.create({
      name: "VIP"
    })
    .then(({ customer_group }) => {
      console.log(customer_group);
         // Find the customer with the highest count
const highestCountCustomer = Object.values(customerData).reduce((prev, curr) => (curr.count > prev.count) ? curr : prev);

// Find the customer with the highest total amount
const highestTotalAmountCustomer = Object.values(customerData).reduce((prev, curr) => (curr.totalAmount > prev.totalAmount) ? curr : prev);

// Prepare the list of customer ids to add to the VIP group
let customerIdsToAdd = [];

// Check if the highest count customer and the highest total amount customer are the same
if (highestCountCustomer.customerId !== highestTotalAmountCustomer.customerId) {
    // If they are not the same, add both of them
    customerIdsToAdd = [{ id: highestCountCustomer.customerId }, { id: highestTotalAmountCustomer.customerId }];
} else {
    // If they are the same, add only one of them
    customerIdsToAdd = [{ id: highestCountCustomer.customerId }];
}

// Add the customers with the highest count and total amount to the VIP group
medusaAccessed.admin.customerGroups.addCustomers(customer_group.id, {
    customer_ids: customerIdsToAdd,
  })
  .then(({ customer_group }) => {
    console.log("Added customers to VIP group:", customer_group.id);

    // Retrieve each customer's details
    customerIdsToAdd.forEach(async (customerObj) => {
      try {
        const { customer } = await medusaAccessed.admin.customers.retrieve(customerObj.id);
        console.log("Customer retrieved:", customer);
        handleEmail(req,res,customer.email,customer.first_name,customer.last_name)
      } catch (retrieveError) {
        console.error("Error retrieving customer:", retrieveError);
      }
    });
  })
  .catch(addCustomersError => {
    console.error("Error adding customers to VIP group:", addCustomersError);
  });


    })
    
 }
})
.catch(error => {
 console.error("Error retrieving customer groups:", error);
});


  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
