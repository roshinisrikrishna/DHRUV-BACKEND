import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { MEDUSA_BACKEND_URL } from "../config";

// Function to format the date in the desired format
const formatDate = (date) => {
  const currentDate = new Date();
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });

  // Check if the year is the same as the current year
  if (date.getFullYear() === currentDate.getFullYear()) {
    return `${day}${getDaySuffix(day)} of ${month}`;
  } else {
    const year = date.getFullYear();
    return `${day}${getDaySuffix(day)} of ${month} ${year}`;
  }
};

// Function to get the suffix for the day (e.g., 1st, 2nd, 3rd, 4th)
const getDaySuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const getCurrencySymbol = (currencyCode) => {
  const currencySymbols = {
    usd: "$",
    eur: "€",
    gbp: "£",
    inr: "₹", // Add INR and its symbol
    // Add more currency codes and symbols as needed
  };
  return currencySymbols[currencyCode] || currencyCode;
};

// Main function to handle email sending logic
export const handleEmail = async (req, res, email, firstName, lastName) => {
  // Fetch discounts from the API
  let specificDiscount = null;
  try {
    const response = await axios.get(`${MEDUSA_BACKEND_URL}/store/discountlist`);
    if (response.status === 200 && response.data.discounts) {
      specificDiscount = response.data.discounts.find(discount =>
        discount.rule.conditions.some(condition => condition.type === "customer_groups")
      ) || null;
    }
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return res.status(500).send("Error fetching discounts");
  }

  // Check if a specific discount is found
  if (!specificDiscount) {
    return res.status(404).send("No specific discount found");
  }

  // Prepare the email content based on specific discount
  let discountMessage;
  switch (specificDiscount.rule.type) {
    case "percentage":
      discountMessage = `For ${specificDiscount.rule.value}% OFF use code ${specificDiscount.code}`;
      break;
    case "fixed":
      const currencySymbol = getCurrencySymbol(specificDiscount.regions[0].currency_code);
      discountMessage = `For ${currencySymbol}${specificDiscount.rule.value / 100}/- OFF use code ${specificDiscount.code}`;
      break;
    case "free_shipping":
      discountMessage = `For Free Shipping Charges use code ${specificDiscount.code}`;
      break;
    default:
      discountMessage = `Use CODE ${specificDiscount.code}`;
  }

  let validityMessage = "";
  if (specificDiscount.ends_at) {
    validityMessage = ` - Valid only till ${formatDate(new Date(specificDiscount.ends_at))}`;
  }

  let emailContent = `
  <div style="font-family: 'Trebuchet MS', Helvetica, sans-serif; text-align: center; color: black; background-color: #fcfcfc;">
    <div style="text-align: left; margin-left: 20px;">
      <h2>Hi ${firstName} ${lastName},</h2>
    </div>
    <h1 style="color: #333;">YOU ARE OUR MOST SPECIAL CUSTOMER NOW</h1>
    <h1 style="color: #333;">Grab the exciting VIP Offer before it is gone</h1>
  
    <div style="display: inline-block; margin: 0 auto;">
      <div style="background-color: #f7aa36; margin: 10px 0; padding: 5px; border-radius: 8px;">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX4lLIKcOhkgroTidItraBcanhVUYEAB6KPQ&usqp=CAU" alt="Discount Image" style="max-width: 800px;  height: auto; border-radius: 8px;">
        <div style="font-size: 52px; margin: 20px 0; font-weight: bold;">
          ${specificDiscount.rule.type === "fixed" ? `${getCurrencySymbol(specificDiscount.regions[0].currency_code)}${specificDiscount.rule.value / 100}/- OFF` : ''}
          ${specificDiscount.rule.type === "percentage" ? `${specificDiscount.rule.value}% OFF` : ''}
          ${specificDiscount.rule.type === "free_shipping" ? 'Free Shipping Charges' : ''}
        </div>
        <div style="font-size: 14px; border: 2px solid black; display: inline-block; padding: 5px 10px; margin: 5px 0; font-weight: bold;">
          CODE: ${specificDiscount.code}
        </div>
        ${validityMessage ? `<div style="font-size: 16px; margin-top: 10px;">${validityMessage}</div>` : ''}
      </div>
    </div>
  </div>`;
    

  // Create a nodemailer transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.NODEMAILER_GMAIL_USER, // Email user from environment variables
      pass: process.env.NODEMAILER_GMAIL_PASSWORD // Email password from environment variables
    }
  });

  // Set up email data with HTML content
  let mailOptions = {
    from: process.env.NODEMAILER_GMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: 'CONGRATULATIONS! YOU ARE A VIP CUSTOMER NOW', // Subject line
    html: emailContent, // HTML content
  };

  // Send the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email ", error);
      return res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: ", info.response);
      return res.status(200).send("Email sent successfully");
    }
  });
};
