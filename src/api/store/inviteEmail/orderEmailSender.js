// Import nodemailer for sending emails
import * as nodemailer from 'nodemailer';
// Import path module for file path handling
import path from 'path';
import { MEDUSA_BACKEND_URL } from "../config";

// Function to format order status string
const formatStatus = (str) => {
  // Replace underscores with spaces and capitalize the first letter
  const formatted = str.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}

// Main function to handle email sending logic
export const handleEmail = (req, res) => {
  // Extract order details from the request body
 const email = req.body.email;
 const role = req.body.role;
 const link = req.body.link;

 console.log('email', email)
 console.log('role', role)
 console.log('link', link)
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

  
  // Set up email data with HTML content and attachments
  // Set up email data with HTML content and attachments
const mailOptions = {
  from: process.env.NODEMAILER_GMAIL_USER,
  to: email,
  subject: "Invitation to Join",
  html: `<p>Click the link below to join:</p><p><a href="${MEDUSA_ADMIN_URL}/invite?token=${link}">Join Now</a></p>`,
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
  email: email,
});
};