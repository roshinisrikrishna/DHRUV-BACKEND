import axios from "axios";
import Medusa from "@medusajs/medusa-js";
import {
  type ScheduledJobConfig,
  type ScheduledJobArgs,
} from "@medusajs/medusa/dist";

export default async function handler({
  container,
  data,
  pluginOptions,
}: ScheduledJobArgs) {

    const medusa = new Medusa({ baseUrl: "http://195.35.20.220:9000", maxRetries: 3 });

  // Define the URL of the API you want to call
  const apiUrl = "http://195.35.20.220:9000/store/vipCustomer";

  let twoHoursAgo = new Date();
twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

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

      medusaAccessed.admin.orders.list()
.then(({ orders, limit, offset, count }) => {
 orders.forEach(order => {
    let orderTime = new Date(order.updated_at);
    if (orderTime >= twoHoursAgo) {
      console.log(`Order ${order.id} was updated within the last 2 hours.`);
      axios.post(apiUrl)
        .then(response => {
          console.log("POST request successful");
          console.log("Response data:", response.data);
        })
        .catch(error => {
          console.error("POST request failed with status:", error);
        });
    }
 });
})
.catch(error => {
 console.error("Error fetching orders:", error);
});

      
    // Make the POST request without a request body
    // const response = await axios.post(apiUrl);

    // Check if the request was successful
    // if (response.status === 200) {
    //   console.log("POST request successful");
    //   console.log("Response data:", response.data);
    // } else {
    //   console.error("POST request failed with status:", response.status);
    // }
  } catch (error) {
    console.error("Error making POST request:", error);
  }
}

export const config: ScheduledJobConfig = {
    name: "email-vip-daily",
    schedule: "0 */2 * * *", // Every 2 hours
    data: {},
   };
   

