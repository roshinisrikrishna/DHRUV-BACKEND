// Import nodemailer for sending emails
import * as nodemailer from 'nodemailer';
// Import path module for file path handling
import path from 'path';

// Function to format order status string
const formatStatus = (str) => {
  // Replace underscores with spaces and capitalize the first letter
  const formatted = str.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}

// Main function to handle email sending logic
export const handleEmail = (req, res) => {
  // Extract order details from the request body
  const order = req.body.order;
  const orderEmail = req.body.order.email;
  const orderItems = req.body.order.items;
  const orderTotal = req.body.order.total;

  // Logging for debugging
  console.log("orderEmail ", orderEmail)
  console.log("orderItems", orderItems)
  console.log("orderTotal", orderTotal)

  // Calculate total number of items in the order
  const items = order.items.reduce((acc, i) => acc + i.quantity, 0)

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

  // Define the path to the logo image
  const logoPath = path.resolve('C://Users//Roshini//Downloads//my-medusa-backend-admin//src//api//store//register//kamyalogo.png');

  // Set up email data with HTML content and attachments
  let mailOptions = {
    from: process.env.NODEMAILER_GMAIL_USER, // Sender address
    to: order.email, // Recipient address
    subject: 'Your Order was Successfully placed', // Subject line
    // HTML content for the email
  html: `
  <style>
   .text {
     font-size: 18px;
   }
   .bold {
     font-weight: bold;
   }
  </style>
  <div style="background-color: white; color: #000; padding: 50px; ">
   <p class="text" style="font-weight: bold; margin-bottom: 20px; font-size: 20px; color: #000;">Thank you, your order was successfully placed.</p>
   <p class="text bold" style="font-weight: bold; margin-bottom: 20px; font-size: 16px;">Order ID: #${order.display_id}</p>
   <p class="text" style="margin-bottom: 20px; font-size: 14px;">${order.id.split("order_")[1]}</p>
   <p class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">${new Date(order.created_at).toDateString()}${" , "}${order.items.reduce((acc, i) => acc + i.quantity, 0)} items</p>
   <table style="width:100%">
     <thead>
       <tr>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px; ">Product</th>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px;">Total</th>
       </tr>
     </thead>
     <tbody>
       ${order.items.map(item => {
         const formatter = new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: order.currency_code,
         });
         const formattedTotal = formatter.format(item.total * 0.01);
         return `
           <tr>
             <td class="text" style="margin-bottom: 20px; font-size: 13px;"><span class="bold" style="font-size: 14px;">${item.title}</span><br>type: ${item.description.replace(/#.*\//, '').trim()}<br>Quantity: ${item.quantity}</td>
             <td class="text" style="font-weight: bold; margin-bottom: 20px; font-size: 15px;">${formattedTotal}</td>
           </tr>
         `;
       }).join('')}
     </tbody>
   </table>
   <table style="width:100%; margin-top: 50px;">
     <thead>
       <tr>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px; "></th>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px;"></th>
       </tr>
     </thead>
     <tbody>
        <tr>
             <td class="text" style=" margin-bottom: 20px; font-size: 16px; color: #000;">Subtotal</td>
             <td class="text" style=" margin-bottom: 20px; font-size: 16px; color: #000;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.subtotal * 0.01)}</td>
           </tr>     
     </tbody>
   </table>
   <table style="width:100%">
     <thead>
       <tr>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px; color: #000;"></th>
         <th class="text bold" style="width:20%; text-align:left; font-size: 16px; color: #000;"></th>
       </tr>
     </thead>
     <tbody>
        <tr>
             <td class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">Shipping</td>
             <td class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.shipping_total * 0.01)}</td>
           </tr>     
     </tbody>
   </table>
   <table style="width:100%">
   <thead>
     <tr>
       <th class="text bold" style="width:20%; text-align:left; font-size: 16px; "></th>
       <th class="text bold" style="width:20%; text-align:left; font-size: 16px;"></th>
     </tr>
   </thead>
   <tbody>
      <tr>
           <td class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">Taxes</td>
           <td class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.tax_total * 0.01)}</td>
         </tr>     
   </tbody>
 </table>
   <hr />
   <table style="width:100%">
   <thead>
     <tr>
       <th class="text bold" style="width:20%; text-align:left; font-size: 16px; "></th>
       <th class="text bold" style="width:20%; text-align:left; font-size: 16px;"></th>
     </tr>
   </thead>
   <tbody>
      <tr>
           <td class="text" style="font-weight: 500; margin-bottom: 20px; font-size: 16px;" color: #000;">Total</td>
           <td class="text" style="font-weight: 500; margin-bottom: 20px; font-size: 16px; color: #000;"> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code }).format(order.total * 0.01)}</td>
         </tr>     
   </tbody>
 </table>
   <img src="cid:logo" alt="Kamyaarts Logo" style="display: block; margin: 0 auto;">

  </div>
  `,
   // Attachment (logo image)
   attachments: [{
    filename: 'kamyalogo.png',
    path: logoPath,
    cid: 'logo' // Content ID for embedding the image in the email
  }]
};

// Send the email using the transporter
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email ", error);
  } else {
    console.log("Email sent: ", info.response)
  }
})

// Send a JSON response with order details
res.json({
  order: order,
});
};