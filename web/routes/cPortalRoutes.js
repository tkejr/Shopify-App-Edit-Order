import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
} from "../db.js";
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

router.post("/scriptTag", async (req, res) => {
  try {
    // Session is built by the OAuth process
    const script_tag = new shopify.api.rest.ScriptTag({
      session: res.locals.shopify.session,
    });
    script_tag.event = "onload";
    script_tag.src = "https://editify-cportal.kejrtech.com/getScript";
    // script_tag.display_scope = "order_status";
    script_tag.cache = true;
    await script_tag.save({ update: true });
    console.log(script_tag);
    // const tags = await shopify.api.rest.ScriptTag.all({
    //   session: res.locals.shopify.session,
    // });
    // console.log(tags);
    res.status(200).json({
      message: "Script Tag created successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating script tag:", error);
    res.status(500).json({
      error: "An error occurred while creating the script tag.",
    });
  }
});

export default router;
