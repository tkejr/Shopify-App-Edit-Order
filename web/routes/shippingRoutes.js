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
  console.log("========== In Update Shipping =============");
  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "shipping_lines",
  });
  //orderData.shipping_lines
  res.json(orderData.shipping_lines);
});

router.get("/taxLines/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;

  const orderData = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
    fields: "tax_lines",
  });

  res.json(orderData.tax_lines);
});
router.put("/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const shipping_and_tax_info = req.body;
  const updated_shipping_lines = shipping_and_tax_info.shippingCostDetails;

  //console.log("========",updated_shipping_lines, shipping_and_tax_info)
  //const updated_tax_lines  = shipping_and_tax_info.taxLines;
  //console.log('==========',updated_tax_lines)
  /*
    const line_item_tax_lines = [{
       
        "rate": updated_tax_lines[0].rate,
        "title": updated_tax_lines[0].title
    },
    {
       
        "rate": updated_tax_lines[1].rate,
        "title": updated_tax_lines[1].title
    },
]
*/

  const orderId = req.params["id"];
  let status = 200;
  let error;
  const order = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
  });
  const newOrder = new shopify.api.rest.Order({ session: session });
  //newOrder.shipping_lines = updated_shipping_lines;
  newOrder.shipping_lines = [
    {
      title: "" + updated_shipping_lines[0].title,
      price: "" + updated_shipping_lines[0].price,
    },
  ];
  
  if (order.financial_status === "paid") {
    newOrder.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: parseFloat(order.total_price - order.total_discounts),
      },
    ];
  }else{
    
    newOrder.transactions = [
      {
        kind: "sale",
        status: "success",
        amount: parseFloat( order.total_price - order.total_outstanding),
      },
    ];
  }

  //newOrder.tax_lines = updated_tax_lines;
  newOrder.line_items = order.line_items;
  
  if (order.tags) {
    newOrder.tags = order.tags;
  }
  newOrder.number = order.number;
  newOrder.name = order.name;
  newOrder.customer = order.customer;
  newOrder.billing_address = order.billing_address;

  newOrder.order_number = order.order_number;
  newOrder.shipping_address = order.shipping_address;
  newOrder.financial_status = 'partially_paid';
  //newOrder.payment_terms = order.payment_terms;
  newOrder.created_at = order.created_at;
  newOrder.processed_at = order.processed_at;
  if(order.payment_details)
  {
    newOrder.payment_details = order.payment_details;
  }
  
  //for notes
  newOrder.note = order.note;
  newOrder.total_tax = order.total_tax;
  newOrder.currency = order.currency;

  newOrder.total_discounts = order.total_discounts;
  newOrder.total_discounts_set = order.total_discounts_set;
  newOrder.total_line_items_price = order.total_line_items_price;
  newOrder.total_line_items_price_set = order.total_line_items_price_set;
  //newOrder.total_outstanding = order.total_outstanding;
  //newOrder.total_price = order.total_price;

  //newOrder.total_price_set = order.total_price_set;
 // newOrder.total_shipping_price_set = order.total_shipping_price_set;
  newOrder.total_tax = order.total_tax;
  newOrder.total_tax_set = order.total_tax_set;
  newOrder.total_tip_received = order.total_tip_received;
  newOrder.total_weight = order.total_weight;
  newOrder.updated_at = order.updated_at; //
  newOrder.user_id = order.user_id; //

  newOrder.note_attributes = order.note_attributes;

  newOrder.order_status_url = order.order_status_url;
  newOrder.original_total_duties_set = order.original_total_duties_set;

  newOrder.payment_gateway_names = order.payment_gateway_names;

  newOrder.phone = order.phone;
  newOrder.processing_method = order.processing_method;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  //newOrder.subtotal_price = order.subtotal_price;
  //newOrder.subtotal_price_set = order.subtotal_price_set;

  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  /*
  newOrder.current_subtotal_price = order.current_subtotal_price;
  newOrder.current_subtotal_price_set = order.current_subtotal_price_set;
  newOrder.current_total_discounts = order.current_total_discounts;
  newOrder.current_total_discounts_set = order.current_total_discounts_set;
  newOrder.current_total_duties_set = order.current_total_duties_set;
  newOrder.current_total_price = order.current_total_price;
  newOrder.current_total_price_set = order.current_total_price_set;
   
*/
 newOrder.current_total_tax = order.current_total_tax;
  newOrder.current_total_tax_set = order.current_total_tax_set; 
  newOrder.customer_locale = order.customer_locale;
  newOrder.discount_applications = order.discount_applications;
  if(order.email !== ''){
    newOrder.email = order.email;
  }
 
  /*
    
  order.shipping_lines=  [
    {
        //"id": 2824129971363,
        "title": "UPS® Ground",
        "price": "11.13",
        //"code": "03",
        //"source": "ups_shipping"
    }
]

order.tax_lines =  [
    {
      "price": 13.5,
      "rate": 0.06,
      "title": "State tax"
    }
  ]
  */

  try {
    await newOrder.save({
      update: true,
    });

    await shopify.api.rest.Order.delete({
      session: res.locals.shopify.session,
      id: req.params["id"],
    });
  } catch (e) {
    status = 500;
    error = e.message;
    console.log(e);
  }
  console.log("=====", status, error);
  res.status(status).send({ success: status === 200, error });
});

export default router;
