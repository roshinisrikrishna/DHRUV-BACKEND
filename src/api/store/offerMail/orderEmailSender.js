import * as nodemailer from 'nodemailer';
import { getDiscountList } from './productDiscount';
import { MEDUSA_STORE_URL } from '../config';

// Main function to handle email sending logic
export const handleEmail = async (req, res, email, productInfo) => {
  console.log('productInfo handleEmail', productInfo);

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

// ...

// Define the email text with product information and discounts
let emailText = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Add your styles here */
      .email-container {
        background-color: #FC1258; /* Pink background for the entire email */
        padding: 20px; /* Add padding for spacing */
      }
      .white-box {
        background-color: white; /* White background for the inner box */
        padding: 20px; /* Add padding for spacing */
        width: 95%;
        display: inline-block; /* Make the inner box inline-block */
        border-radius: 5px; /* Add border-radius for rounded corners */
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); /* Add a subtle shadow to the box */
      }
      .button {
        background-color: #FC1258;
        color: #FFFFFF;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 0px;
        border: 1px solid white;
        display: inline-block;
      }
      .email-text {
        color: black;
        font-size: 18px;
        width:95%;
        font-weight: normal;
      }
      .bold-text {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="white-box">
        <p class="email-text">We have a good news for you!</p>
        <p class="email-text">We have exciting discounts with unbelievable offers on products now!</p>
`;

// Check if there are any discounts available
// Check if there are any discounts available
if (productInfo.some(product => getDiscountList(product.product_id))) {
  emailText += `<p class="email-text">You can purchase your favorite products with discounts:</p>`;
} else {
  emailText += `<p class="email-text">All items in your wishlist:</p>`;
}

// Group products by product_id and build product titles and discount responses
const groupedProducts = await productInfo.reduce(async (accPromise, product) => {
  const acc = await accPromise;
  const existingProduct = acc.find(p => p.product_id === product.product_id);
 
  if (existingProduct) {
      // If the product already exists in the accumulator, append the product title
      existingProduct.product_titles.push(product.product_title);
  } else {
      // Otherwise, create a new entry for the product
      const discountsResponse = await getDiscountList(product.product_id);
      acc.push({
        product_id: product.product_id,
        product_titles: [product.product_title],
        discountsResponse
      });
  }
  
  return acc;
  }, Promise.resolve([]));
 
 // Iterate through groupedProducts and add them to emailText
 for (const group of groupedProducts) {
  if (group.discountsResponse && group.discountsResponse.code && group.discountsResponse.value && group.discountsResponse.type) {
      // Combine product titles with "and"
      const productTitles = group.product_titles.join(' and ');
 
      emailText += `
        <p class="email-text">
          You can purchase your favorite products 
          <span class="bold-text">${productTitles}</span> 
          on a discount of  
          <span class="bold-text">${group.discountsResponse.value}${group.discountsResponse.type}</span> 
          off using code: 
          <span class="bold-text">${group.discountsResponse.code}</span>
        </p>`;
  }
 }
 
// Iterate through productInfo and list other products with null discountsResponse
for (const product of productInfo) {
  const discountsResponse = await getDiscountList(product.product_id);

  // Check if discountsResponse is null
  if (!discountsResponse) {
    emailText += `
      <p class="email-text" >
        <span class="bold-text">${product.product_title}</span>
      </p>
    `;
  }
}


// Add "Hurry Now!" text and a "Shop Now" button with a link
// ...

// Add "Hurry Now!" text and a "Shop Now" button with a link
emailText += `
        <p class="email-text bold-text" >Hurry Now!</p>
        <p style="text-align: center;">
          <a class="button" href="${MEDUSA_STORE_URL}/men" style="background-color: #FC1258; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; border: 2px solid #FFFFFF; margin: 0 auto;">Shop Now</a>
        </p>
      </div>
    </div>
  </body>
  </html>
`;

// ...


// Set up email data with HTML content and attachments
let mailOptions = {
  from: process.env.NODEMAILER_GMAIL_USER, // Sender address
  to: email, // Recipient address
  subject: 'Your Wishlist misses you', // Subject line
  html: emailText, // Use the HTML content with product information and the styled button
};

// ...

  // Send the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email ", error);
      res.sendStatus(500);

    } else {
      console.log("Email sent: ", info.response);
        res.sendStatus(200);

    }
  });

  // Send a JSON response with order details
  // res.sendStatus(200);
};
