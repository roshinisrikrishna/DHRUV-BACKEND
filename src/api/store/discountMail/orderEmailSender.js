import * as nodemailer from 'nodemailer';

// Main function to handle email sending logic
export const handleEmail = async (req, res, email, discounts) => {
  // Create a nodemailer transporter for sending emails

  console.log('discounts discountMail', discounts)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.NODEMAILER_GMAIL_USER, // Email user from environment variables
      pass: process.env.NODEMAILER_GMAIL_PASSWORD // Email password from environment variables
    }
  });

  // Prepare the email content
  let emailContent = `
  <div style="font-family: 'Trebuchet MS', Helvetica, sans-serif; text-align: center; color: black; background-color: #fcfcfc;">
  <h1 style="color: #333;">Exclusive Offers Just for You!</h1>
    <div style="display: inline-block; margin: 0 auto;">`;
  const colors = ['#faacec', '#fc6aac', '#f7aa36', '#fac6ac'];
  const imageUrls = [
    'https://img.freepik.com/premium-photo/fashion-portrait-happy-woman-with-shopping-bags-retail-sale-clothes-offer-discount-deal-choice-customer-girl-shopper-holding-gift-present-product-promotion-white-background_590464-202269.jpg?w=2000',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRciMffoP91nLUebZyJJlM5Ez7dShto99-YbA&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdrsTCOLOliT4T5yPBXrK6NRcphax0Nv0zkw&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSipyo5GhOiDRzuO7QQa-WS9oTH8Yro6fps-A&usqp=CAU'
  ];

  discounts.forEach((discount, index) => {
    const color = colors[index % colors.length];
    const imageUrl = imageUrls[index % imageUrls.length];
    const textStyle = 'font-size: 30px; margin: 5px 0;';
    emailContent += `
    <div style="background-color: ${color}; margin: 10px 0; padding: 5px; border-radius: 8px;">
    <div style="${textStyle} font-weight: bolder; font-size: 50px; margin-bottom: 10px; color: white;">buy more, save more</div>
       <img src="${imageUrl}" alt="Discount Image" style="width: 100%; max-width:500px; height: auto; border-radius: 8px;">
       ${discount.value ? `<div style="${textStyle} font-weight: bolder; font-size: 50px; margin-bottom: 25px;">${discount.value}</div>` : ''}
       ${discount.isFreeShipping ? `<div style="${textStyle} font-weight: bolder; font-size: 40px; margin-bottom: 25px;">FREE SHIPPING<br>CHARGES</div>` : ''}
       <div style="border: 2px solid black; display: inline-block; padding: 5px 10px; margin: 5px 0; font-weight: bold; margin-bottom: 10px;">CODE: ${discount.code}</div>
       ${discount.validity ? `<div style="${textStyle} font-weight: bold; font-size: 34px;">Valid until ${discount.validity}</div>` : ''}
    </div>
   `;
  });
  emailContent += `</div></div>`;

  // Set up email data with HTML content
  let mailOptions = {
    from: process.env.NODEMAILER_GMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: 'Hurry Up! Exciting Offers Waiting for You', // Subject line
    html: emailContent, // HTML content
  };

  // Send the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};
