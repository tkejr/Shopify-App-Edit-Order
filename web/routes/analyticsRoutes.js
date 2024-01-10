import express from "express";
import { getUser, addUser, updateUser } from "../db.js";
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

router.put("/", async (req, res) => {
  const shopId = res.locals.shopify.session.shop;
  const body = req.body; // Assuming the updated user data is sent in the request body

  mixpanel.track("Update User", {
    distinct_id: shopId,
  });

  try {
    // Update the user in the database
    const updatedUser = await updateUser(shopId, body.updatedData);

    console.log("User updated:", updatedUser);
    res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    // Handle errors
    console.error("Error updating user", error);
    res.status(500).json({
      error: "Error updating user",
    });
  }
});

export default router;
