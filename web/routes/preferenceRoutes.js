import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
  updateUser,
} from "../db.js";
import Mixpanel from "mixpanel";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");

const router = express.Router();

router.get("/", async (req, res) => {
  mixpanel.track("CP Page Opened", {
    distinct_id: res.locals.shopify.session.shop,
  });
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  try {
    const userId = await getUserIdByUrl(shopUrl);

    if (userId === null) {
      return res.status(404).send("User not found for the given shop URL");
    }

    const userPreference = await getUserPreferences(userId);

    if (userPreference === null) {
      return res.status(400).send("Invalid Id");
    }
    userPreference.shop = shopUrl;

    res.json(userPreference);
  } catch (error) {
    console.error("Error in Get preferenceRoutes:", error);
    res.status(500).send("Internal server error");
  }
});

router.put("/", async (req, res) => {
  mixpanel.track("CP Preferences Updated", {
    distinct_id: res.locals.shopify.session.shop,
  });
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  console.log("===== TEST in CP====");
  console.log(session);

  const updateData = {
    access_token: session.accessToken,
  };

  console.log("Test Update Preference");
  const updatedUser = await updateUser(shopUrl, updateData);
  const updatePref = await updateUserPreference(updatedUser.id, req.body);
  // console.log("===== TEST in CP====");
  // console.log(updatedUser);
  res.status(200).send("OK");
});

export default router;
