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
  console.log("====== Inside Update Billing ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  const orderId = req.params["id"];

  // Create the data payload for the request'
  const order = new shopify.api.rest.Order({ session: session });
  order.id = orderId;
  order.shipping_address = edited_billing;
  await order.save({
    update: true,
  });
});

export default router;
