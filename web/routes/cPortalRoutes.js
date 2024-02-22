import express from "express";
import shopify from "../shopify.js";
import Mixpanel from "mixpanel";
import { DataType } from "@shopify/shopify-api";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");

const router = express.Router();

router.get("/viewLast", async (req, res) => {
  mixpanel.track("CP View Order Status", {
    distinct_id: res.locals.shopify.session.shop,
  });
  try {
    const data = await shopify.api.rest.Order.all({
      session: res.locals.shopify.session,
      status: "any",
      limit: 1, // new to make the limit 250 instead of 50
    });

    console.log(data);
    res.status(200).json({
      data,
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching most recent order:", error);
    res.status(500).json({
      error: "An error occurred while fetching the most recent order.",
    });
  }
});

export default router;
