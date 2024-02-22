import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
  updateUser,
} from "../db.js";
import Mixpanel from "mixpanel";
import shopify from "../shopify.js";
import { SCRIPT_URL, PAGE_HTML } from "../const.js";
const mixpanel = Mixpanel.init("834378b3c2dc7daf1b144cacdce98bd0");

const router = express.Router();

router.get("/", async (req, res) => {
  mixpanel.track("CP Page Opened", {
    distinct_id: res.locals.shopify.session.shop,
  });

  console.log("IN GET PREFERENCE");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  try {
    const userId = await getUserIdByUrl(shopUrl);
    console.log("userId", userId);

    if (userId === null) {
      return res.status(404).send("User not found for the given shop URL");
    }

    const userPreference = await getUserPreferences(userId);
    console.log("userPreference", userPreference);

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

  const updateData = {
    access_token: session.accessToken,
  };

  const updatedUser = await updateUser(shopUrl, updateData);
  const userPreference = await getUserPreferences(updatedUser.id);
  console.log("userPreference", userPreference);

  console.log("TEST IN CP ROUTE");
  if (req.body.enable == true) {
    console.log("IN ENABLE");

    //create script tag
    const script_tag = new shopify.api.rest.ScriptTag({ session: session });
    script_tag.event = "onload";
    script_tag.src = SCRIPT_URL;
    script_tag.display_scope = "order_status";
    await script_tag.save({
      update: true,
    });

    //create page
    const page = new shopify.api.rest.Page({ session: session });
    page.title = "Customer Portal";
    page.body_html = PAGE_HTML;
    await page.save({
      update: true,
    });
    req.body["script_id"] = script_tag.id.toString();
    req.body["page_id"] = page.id.toString();
  } else if (req.body.enable == false) {
    console.log("IN DISABLE");
    try {
      const script_tag = await shopify.api.rest.ScriptTag.delete({
        session: session,
        id: userPreference.script_id,
      });

      const page = await shopify.api.rest.Page.delete({
        session: session,
        id: userPreference.page_id,
      });
      console.log("Script tag deleted successfully:", script_tag);
      console.log("Page deleted successfully:", page);
    } catch (error) {
      console.log("Error in deleting script tag:", error);
    }
    req.body["script_id"] = null;
    req.body["page_id"] = null;
  }
  const updatePref = await updateUserPreference(updatedUser.id, req.body);

  res.status(200).send("OK");
});

export default router;
