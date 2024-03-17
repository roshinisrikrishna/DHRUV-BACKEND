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
  const email = req.body.email
//   const orderEmail = req.body.order.email;
  const orderItems = req.body.order.items;
  const orderTotal = req.body.order.total;

  // Logging for debugging
  console.log("orderEmail Notification", email)
  console.log("order notification email", order)
  console.log('order.shipping_address', order.shipping_address)

  // Calculate total number of items in the order
  const items = order.items.reduce((acc, i) => acc + i.quantity, 0)
  const firstPayment = order.payments[0];

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

  // Set up email data with HTML content and attachments
  let mailOptions = {
    from: process.env.NODEMAILER_GMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: 'New Order has been placed', // Subject line
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
   <p class="text" style="font-weight: bold; margin-bottom: 20px; font-size: 20px; color: #000;">NEW ORDER IS READY TO BE SHIPPED.</p>
   <p class="text bold" style="font-weight: bold; margin-bottom: 20px; font-size: 16px;">Order ID: #${order.display_id}</p>
   <p class="text" style="margin-bottom: 20px; font-size: 14px;">${order.id.split("order_")[1]}</p>
   <p class="text" style=" margin-bottom: 20px; font-size: 14px; color: #000;">${new Date(order.created_at).toDateString()}${" , "}${order.items.reduce((acc, i) => acc + i.quantity, 0)} items</p>
   <table style="width:100%">
     <thead>
     <tr>
     <th class="text bold" style="text-align:left;">Product Title</th>
     <th class="text bold" style="text-align:left;">Type</th>
     <th class="text bold" style="text-align:left;">Quantity</th>
     <th class="text bold" style="text-align:left;">Total</th>
   </tr>
     </thead>
     <tbody>
            ${order.items.map(item => {
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: firstPayment ? firstPayment.currency_code : 'USD', // Use a default currency if not available
                });
                const formattedTotal = formatter.format(item.unit_price * 0.01);
          
            const itemType = item.description.replace(/#.*\//, '').trim();
            return `
              <tr>
                <td class="text">${item.title}</td>
                <td class="text">${itemType}</td>
                <td class="text">${item.quantity}</td>
                <td class="text bold">${formattedTotal}</td>
              </tr>
            `;
          }).join('')}
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
   <tbody style="margin-top: 15px;">
      <tr>
           <td class="text" style="font-weight: 500; margin-bottom: 20px; font-size: 16px;" color: #000;">Total</td>
           <td class="text" style="font-weight: 500; margin-bottom: 20px; font-size: 16px; color: #000;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: firstPayment ? firstPayment.currency_code : 'USD' }).format(firstPayment ? firstPayment.amount * 0.01 : 0)}</td>
           </tr>     
   </tbody>
 </table>
 <p class="text bold" style="font-weight: bold; margin-bottom: 20px; font-size: 22px;">Shipping Address:</p>
      <p class="text" style="margin-bottom: 5px; font-size: 18px;">${order.shipping_address.first_name} ${order.shipping_address.last_name}</p>
      <p class="text" style="margin-bottom: 5px; font-size: 18px;">${order.shipping_address.address_1}${order.shipping_address.address_2 ? ', ' + order.shipping_address.address_2 : ''}</p>
      <p class="text" style="margin-bottom: 5px; font-size: 18px;">${order.shipping_address.city}, ${order.shipping_address.province}</p>
      <p class="text" style="margin-bottom: 20px; font-size: 18px;">${order.shipping_address.postal_code}, ${order.shipping_address.country_code.toUpperCase()}</p>
      <p class="text" style="margin-bottom: 20px; font-size: 18px;">Phone: ${order.shipping_address.phone}</p>
   
  </div>
  `
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