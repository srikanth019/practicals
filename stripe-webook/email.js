const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const product =
  "https://drive.google.com/file/d/1KtbeO2ogA2_T9fJGWT9sJVkwYBXOzXb8/view?usp=drive_link";

exports.sendMail = async (toMail) => {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.EMAIL, // sender address
    to: toMail, // list of receivers
    subject: "Hello from stripe payment", // Subject line
    text: "Thank you for your payment", // plain text body
    html: `Hello ${toMail}. Here is the link for the product you purchased ${product} 
    `,
  });

  console.log("Message sent: %s", info.messageId);
};
