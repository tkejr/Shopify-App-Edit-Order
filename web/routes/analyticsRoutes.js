import express from "express";
import { getUser } from "../db.js";
import shopify from "../shopify.js";
import Mixpanel from "mixpanel";
import { DataType } from "@shopify/shopify-api";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");

const router = express.Router();

router.get("/", async (req, res) => {
  mixpanel.track("View Analytics", {
    distinct_id: res.locals.shopify.session.shop,
  });
  try {
    const data = await getUser(res.locals.shopify.session.shop);

    console.log(data);
    res.status(200).json({
      data,
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching analytics", error);
    res.status(500).json({
      error: "analytics",
    });
  }
});

export default router;
