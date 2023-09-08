import express from "express";
import {
  updateUserPreference,
  getUserIdByUrl,
  getUserPreferences,
} from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

    res.json(userPreference);
  } catch (error) {
    console.error("Error in Get preferenceRoutes:", error);
    res.status(500).send("Internal server error");
  }
});

router.put("/", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;

  const { time_to_edit, enable } = req.body;

  try {
    const userId = await getUserIdByUrl(shopUrl);

    if (userId === null) {
      return res.status(404).send("User not found for the given shop URL");
    }

    const updatedPreference = await updateUserPreference(
      userId,
      time_to_edit,
      enable
    );

    if (updatedPreference === null) {
      return res.status(400).send("Invalid update data");
    }

    res.json(updatedPreference);
  } catch (error) {
    console.error("Error in preferenceRoutes:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
