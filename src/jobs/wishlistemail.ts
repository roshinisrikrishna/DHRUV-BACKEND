import axios from "axios";
import {
  type ScheduledJobConfig,
  type ScheduledJobArgs,
} from "@medusajs/medusa/dist";

export default async function handler({
  container,
  data,
  pluginOptions,
}: ScheduledJobArgs) {
  // Define the URL of the API you want to call
  const apiUrl = "http://195.35.20.220:9000/store/offerMail";

  try {
    // Make the POST request without a request body
    const response = await axios.post(apiUrl);

    // Check if the request was successful
    if (response.status === 200) {
      console.log("POST request successful");
      console.log("Response data:", response.data);
    } else {
      console.error("POST request failed with status:", response.status);
    }
  } catch (error) {
    console.error("Error making POST request:", error);
  }
}

export const config: ScheduledJobConfig = {
  name: "email-wishlist-tuesday",
  schedule: "0 10 * * 2", // 9:30 PM (21:30) on Tuesday (2)
  data: {},
};

