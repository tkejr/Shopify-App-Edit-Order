import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
} from "../db.js";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");
import shopify from "../shopify.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  console.log("========== In Update Billing =============");
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "shipping_address",
  });

  res.json(orderData.shipping_address);
});

router.put("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  const orderId = req.params["id"];

  // Create the data payload for the request
  const data = {
    order: {
      id: orderId,
      shipping_address: edited_billing,
    },
  };

  try {
    const response = await fetch(
      `https://${shopUrl}/admin/api/2023-07/orders/${orderId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken, // Replace with your access token
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    const responseData = await response.json();

    console.log("======== Order Updated Res =========");
    console.log(responseData);

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).send("Error updating order");
  }
});

export default router;
