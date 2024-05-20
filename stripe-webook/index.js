const express = require("express");
const { sendMail } = require("./email");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.send("Hello from webhook");
});
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.ENDPOINT_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];
    console.log(/sig/, sig);

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log(/event/, event);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    let session;

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        session = event.data.object;
        console.log(/session_failed/, session);
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case "checkout.session.completed":
        session = event.data.object;
        console.log(/session_success/, session);
        // sendMail(session.customer_details.email);
        // Then define and call a function to handle the event checkout.session.completed
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
