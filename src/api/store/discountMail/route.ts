import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import axios from "axios";
import { CustomerService } from '@medusajs/medusa';
import { handleEmail } from "./orderEmailSender";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const customerService = req.scope.resolve<CustomerService>("customerService");
      
    // Retrieve all customers using the customer service
    const customers = await customerService.list({});
    
    const response = await axios.get("http://195.35.20.220:9000/store/discountlist");
    const responseData = response.data;

    // Apply the provided functions to responseData
    const transformedDiscounts = renderDiscounts(responseData.discounts);

    
    // Send an email to each customer
    for (const customer of customers) {
      if (customer.email) {
        await handleEmail(req, res, customer.email, transformedDiscounts);
      }
    }

    res.status(200).send({ message: "Emails sent successfully" });
  } catch (error) {
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

// Now you can use `specificDiscount` for separate handling if needed.
