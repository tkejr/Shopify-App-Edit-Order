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
    const order = new shopify.api.rest.Order({
      session: res.locals.shopify.session,
    });
    order.line_items = [
      {
        title: "Big Brown Bear Boots",
        price: 74.99,
        grams: "1300",
        quantity: 3,
        tax_lines: [
          {
            price: 13.5,
            rate: 0.06,
            title: "State tax",
          },
        ],
      },
    ];
    order.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: 238.47,
      },
    ];
    order.total_tax = 13.5;
    order.customer = {
      first_name: "Paul",
      last_name: "Norman",
      email: "paul.norman@example.com",
    };
    order.billing_address = {
      first_name: "John",
      last_name: "Smith",
      address1: "123 Fake Street",
      phone: "555-555-5555",
      city: "Fakecity",
      province: "Ontario",
      country: "Canada",
      zip: "K2P 1L4",
    };
    order.shipping_address = {
      first_name: "Test",
      last_name: "Test",
      address1: "123 Fake Street",
      phone: "777-777-7777",
      city: "Fakecity",
      province: "Ontario",
      country: "Canada",
      zip: "K2P 1L4",
    };
    order.email = "test@example.com";
    order.transactions = [
      {
        kind: "authorization",
        status: "success",
        amount: 50.0,
      },
    ];
    order.financial_status = "paid";
    await order.save({
      update: true,
    });

    console.log("===================== data =====================");
    console.log(order);
    res.status(200).json({
      order,
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
