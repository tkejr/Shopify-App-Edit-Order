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
    fields: "billing_address",
  });

  
  res.json(orderData.billing_address);
});

router.put("/:id", async (req, res) => {
  console.log("====== Inside Update Billing ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  //@ts-ignore
  let status = 200; 
  let error = null;
  //find old order
  const order = await shopify.api.rest.Order.find({
    session: session,
    id: req.params["id"],
  
  });
  // Create new order with new stuff
  
  const newOrder = new shopify.api.rest.Order({ session: session });
  newOrder.line_items = order.line_items; 


  
  edited_billing.name = edited_billing.first_name + ' ' + edited_billing.last_name; 
  newOrder.billing_address = edited_billing;
  //console.log(newOrder.billing_address)
  newOrder.order_number = order.order_number; 
  newOrder.shipping_address = order.shipping_address;
  
  //for same number
  newOrder.number = order.number; 
  newOrder.name = order.name; 
  newOrder.customer = order.customer; 
   

  
  //this is the list of financial status
  // authorized expired paid partially_paid partially_refunded pending refunded unpaid voided
  if(order.financial_status === 'paid'){
    newOrder.transactions = [
      {
        "kind": "sale",
        "status": "success",
        "amount": parseFloat((order.total_price - order.total_discounts))
      }
    ];
  }
  
    newOrder.financial_status = order.financial_status; 
    newOrder.payment_terms = order.payment_terms;
    
 
  if (order.tags) {
    newOrder.tags = order.tags;
  }


  newOrder.created_at = order.created_at;
  newOrder.processed_at = order.processed_at;
  //for notes
  newOrder.note = order.note;
  newOrder.total_tax = order.total_tax;
  newOrder.currency = order.currency;
  
  newOrder.total_discounts = order.total_discounts;
  newOrder.total_discounts_set = order.total_discounts_set;
  newOrder.total_line_items_price = order.total_line_items_price;
  newOrder.total_line_items_price_set = order.total_line_items_price_set;
  newOrder.total_outstanding = order.total_outstanding;
  newOrder.total_price = order.total_price;
  
  newOrder.total_price_set = order.total_price_set;
  newOrder.total_shipping_price_set = order.total_shipping_price_set;
  newOrder.total_tax = order.total_tax;
  newOrder.total_tax_set = order.total_tax_set;
  newOrder.total_tip_received = order.total_tip_received;
  newOrder.total_weight = order.total_weight;
  newOrder.updated_at = order.updated_at; //
  newOrder.user_id = order.user_id; //
  
  newOrder.payment_details = order.payment_details;
  
  newOrder.subtotal_price = order.subtotal_price;
  newOrder.subtotal_price_set = order.subtotal_price_set;
  


  newOrder.cart_token = order.cart_token;
  newOrder.checkout_token = order.checkout_token;
  newOrder.client_details = order.client_details;
  newOrder.closed_at = order.closed_at;
  newOrder.company = order.company;
  newOrder.current_subtotal_price = order.current_subtotal_price;
  newOrder.current_subtotal_price_set = order.current_subtotal_price_set;
  newOrder.current_total_discounts = order.current_total_discounts;
  newOrder.current_total_discounts_set =
    order.current_total_discounts_set;
  newOrder.current_total_duties_set = order.current_total_duties_set;
  newOrder.current_total_price = order.current_total_price;
  newOrder.current_total_price_set = order.current_total_price_set;
  newOrder.current_total_tax = order.current_total_tax;
  newOrder.current_total_tax_set = order.current_total_tax_set;
  newOrder.customer = order.customer;
  newOrder.customer_locale = order.customer_locale;
  newOrder.discount_applications = order.discount_applications;

  newOrder.email = order.email;
  newOrder.estimated_taxes = order.estimated_taxes;
  newOrder.gateway = order.gateway;
  newOrder.landing_site = order.landing_site;
  newOrder.location_id = order.location_id;
  newOrder.merchant_of_record_app_id = order.merchant_of_record_app_id;
  
  newOrder.note_attributes = order.note_attributes;

  newOrder.order_number = order.order_number; //
  newOrder.order_status_url = order.order_status_url;
  newOrder.original_total_duties_set = order.original_total_duties_set;
  
  newOrder.payment_gateway_names = order.payment_gateway_names;
  
  newOrder.phone = order.phone;
  newOrder.processing_method = order.processing_method;
  newOrder.referring_site = order.referring_site;
  newOrder.refunds = order.refunds;
  
  newOrder.shipping_lines = order.shipping_lines;
  newOrder.source_identifier = order.source_identifier;
  //
  
  //console.log(newOrder)
  try {
    //saving the newly created order here
    // @ts-ignore
    await newOrder.save({
      update: true,
    });
    
    //console.log(newOrder, newOrder.line_items[0].price_set, newOrder.payment_details)
    // deleting the old order with the old date
    await shopify.api.rest.Order.delete({
      session: res.locals.shopify.session,
      id: req.params["id"],
    });
  } catch (e) {
    console.log(`Failed to update billing:  ${e.message}`);
    status = 500;

    
    error = e.message;
  }
  
  res.status(status).send({ success: status === 200, error });

});

router.get("/shipping/:id", async (req, res) => {
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

router.put("/shipping/:id", async (req, res) => {
  console.log("====== Inside Update Billing ========");
  const session = res.locals.shopify.session;
  const shopUrl = session.shop;
  const edited_billing = req.body;
  const orderId = req.params["id"];
  let status = 200;
  let error; 
  
  const order = new shopify.api.rest.Order({ session: session });
  order.id = orderId;
  edited_billing.name = edited_billing.first_name + ' ' + edited_billing.last_name; 
  order.shipping_address = edited_billing;
 
  try{
    await order.save({
      update: true,
    });
  
  }
  catch(e){
    status = 500;
    error = e.message;
    console.log(e)
  }
   console.log('=====', status, error)
  res.status(status).send({ success: status === 200, error });
});

export default router;
