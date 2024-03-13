// Import necessary types from the Medusa package and axios for making HTTP requests.
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import axios from "axios";
// Import the CustomerService for fetching customer data.
import { CustomerService } from '@medusajs/medusa';
// Import a custom function to handle email sending.
import { handleEmail } from "./orderEmailSender";

// Define an asynchronous function to handle POST requests.
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Resolve the CustomerService from Medusa's dependency injection container to use its methods.
    const customerService = req.scope.resolve<CustomerService>("customerService");
      
    // Fetch all customers using the customer service's list method.
    const customers = await customerService.list({});
    
    // Make a GET request to a specific URL to retrieve a list of discounts.
    const response = await axios.get("http://195.35.20.220:9000/store/discountlist");
    const responseData = response.data;

    // Transform the fetched discounts using a custom function not defined within this snippet.
    const transformedDiscounts = renderDiscounts(responseData.discounts);
    
    // Iterate over each customer and send them an email with the discount information if they have an email address.
    for (const customer of customers) {
      if (customer.email) {
        await handleEmail(req, res, customer.email, transformedDiscounts);
      }
    }

    // Respond with a success message after all emails have been sent.
    res.status(200).send({ message: "Emails sent successfully" });
  } catch (error) {
    // Catch and log any errors that occur during the process, then respond with an error message.
    console.error("Error:", error);
    res.status(500).send({ error: "Error occurred" });
  }
}

// Helper functions
const getCurrencySymbol = (currencyCode: string) => {
  const currencySymbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    inr: "₹",
    // ... other currency codes and symbols
  };
  return currencySymbols[currencyCode.toLowerCase()] || currencyCode;
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const currentDate = new Date();
  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "short" });

  if (d.getFullYear() === currentDate.getFullYear()) {
    return `${day}${getDaySuffix(day)} of ${month}`;
  } else {
    const year = d.getFullYear();
    return `${day}${getDaySuffix(day)} of ${month} ${year}`;
  }
};

const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

// Function to render discounts
const renderDiscounts = (discounts) => {
  // Find and remove the specific discount for customer groups from the array
  let specificDiscount = null;
  const activeDiscounts = discounts.filter(discount => {
    const isSpecificDiscount = discount.rule.conditions.some(condition => condition.type === "customer_groups");
    if (isSpecificDiscount) {
      specificDiscount = discount;
      return false; // Remove specificDiscount from the array
    }
    return !discount.is_disabled; // Keep only active discounts
  });

  // If there are no active discounts after filtering, return null
  if (activeDiscounts.length === 0) return null;

  // Map over the remaining active discounts and transform them
  return activeDiscounts.map(discount => {
    const hasProductConditions = discount.rule.conditions.some(condition => condition.type === "products");

    // Define the value message based on discount type
    let valueMessage;
    if (discount.rule.type === "fixed") {
      valueMessage = `${getCurrencySymbol(discount.regions[0].currency_code)}${discount.rule.value / 100}/- OFF`;
    } else if (discount.rule.type === "percentage") {
      valueMessage = `${discount.rule.value}% OFF`;
    } else {
      valueMessage = ''; // Default message for other types
    }

    const targetProducts = hasProductConditions ? "special products" : "all products";
    const validityMessage = discount.ends_at ? formatDate(discount.ends_at) : "";

    return {
      id: discount.id,
      code: discount.code,
      value: valueMessage,
      type: discount.rule.type,
      targetProducts: targetProducts,
      validity: validityMessage,
      isFreeShipping: discount.rule.type === "free_shipping"
    };
  });
};

